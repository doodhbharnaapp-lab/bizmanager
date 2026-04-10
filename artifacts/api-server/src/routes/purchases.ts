import { Router } from "express";
import { db } from "@workspace/db";
import { purchasesTable, suppliersTable, productsTable, ledgerEntriesTable } from "@workspace/db/schema";
import { eq, sql, and } from "drizzle-orm";

const router = Router();

let invoiceCounter = 1000;
function getNextInvoice(prefix: string) {
  invoiceCounter++;
  return `${prefix}-${Date.now()}-${invoiceCounter}`;
}

router.get("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    let purchases = await db.select().from(purchasesTable)
      .where(eq(purchasesTable.userId, userId))
      .orderBy(sql`${purchasesTable.date} desc`);
    const { supplierId, startDate, endDate } = req.query;
    if (supplierId) purchases = purchases.filter(p => p.supplierId === parseInt(supplierId as string));
    if (startDate) purchases = purchases.filter(p => p.date >= startDate as string);
    if (endDate) purchases = purchases.filter(p => p.date <= endDate as string);
    res.json(purchases.map(formatPurchase));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id);
    const purchases = await db.select().from(purchasesTable)
      .where(and(eq(purchasesTable.id, id), eq(purchasesTable.userId, userId)));
    if (!purchases[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatPurchase(purchases[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { supplierId, items, paymentMode, notes, date } = req.body;
    const purchaseDate = date || new Date().toISOString().split("T")[0];

    const supplier = await db.select().from(suppliersTable)
      .where(and(eq(suppliersTable.id, supplierId), eq(suppliersTable.userId, userId)));
    if (!supplier[0]) return res.status(400).json({ error: "Supplier not found" });

    let subtotal = 0;
    let totalGst = 0;
    const processedItems: any[] = [];

    for (const item of items) {
      const product = await db.select().from(productsTable)
        .where(and(eq(productsTable.id, item.productId), eq(productsTable.userId, userId)));
      if (!product[0]) continue;
      const gstAmt = (item.purchasePrice * item.quantity * item.gstPercent) / 100;
      const itemTotal = item.purchasePrice * item.quantity + gstAmt;
      subtotal += item.purchasePrice * item.quantity;
      totalGst += gstAmt;
      processedItems.push({
        productId: item.productId,
        productName: product[0].name,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        gstPercent: item.gstPercent,
        gstAmount: gstAmt,
        totalAmount: itemTotal,
      });
      const newQty = parseFloat(product[0].stockQty) + item.quantity;
      await db.update(productsTable)
        .set({ stockQty: String(newQty), purchasePrice: String(item.purchasePrice) })
        .where(and(eq(productsTable.id, item.productId), eq(productsTable.userId, userId)));
    }

    const grandTotal = subtotal + totalGst;
    const invoiceNumber = getNextInvoice("PUR");

    const purchase = await db.insert(purchasesTable).values({
      userId, invoiceNumber, supplierId, supplierName: supplier[0].name, items: processedItems,
      subtotal: String(subtotal), totalGst: String(totalGst), grandTotal: String(grandTotal),
      paymentMode, notes, date: purchaseDate,
    }).returning();

    if (paymentMode === "credit") {
      const currentBalance = parseFloat(supplier[0].balance);
      const newBalance = currentBalance + grandTotal;
      await db.update(suppliersTable).set({ balance: String(newBalance) })
        .where(and(eq(suppliersTable.id, supplierId), eq(suppliersTable.userId, userId)));
      await db.insert(ledgerEntriesTable).values({
        userId, partyType: "supplier", partyId: supplierId,
        type: "purchase", description: `Purchase - Invoice ${invoiceNumber}`,
        debit: "0", credit: String(grandTotal), balance: String(newBalance),
        referenceId: purchase[0].id, referenceType: "purchase", date: purchaseDate,
      });
    }

    res.status(201).json(formatPurchase(purchase[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatPurchase(p: any) {
  return {
    ...p,
    subtotal: parseFloat(p.subtotal || "0"),
    totalGst: parseFloat(p.totalGst || "0"),
    grandTotal: parseFloat(p.grandTotal || "0"),
    items: Array.isArray(p.items) ? p.items : JSON.parse(p.items || "[]"),
    createdAt: p.createdAt?.toISOString?.() || p.createdAt,
  };
}

export default router;
