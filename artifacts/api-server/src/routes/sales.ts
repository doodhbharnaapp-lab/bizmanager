import { Router } from "express";
import { db } from "@workspace/db";
import { salesTable, customersTable, productsTable, ledgerEntriesTable } from "@workspace/db/schema";
import { eq, sql, and } from "drizzle-orm";

const router = Router();

let invoiceCounter = 2000;
function getNextInvoice() {
  invoiceCounter++;
  return `SAL-${Date.now()}-${invoiceCounter}`;
}

router.get("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    let sales = await db.select().from(salesTable)
      .where(eq(salesTable.userId, userId))
      .orderBy(sql`${salesTable.date} desc`);
    const { customerId, startDate, endDate, paymentMode } = req.query;
    if (customerId) sales = sales.filter(s => s.customerId === parseInt(customerId as string));
    if (startDate) sales = sales.filter(s => s.date >= startDate as string);
    if (endDate) sales = sales.filter(s => s.date <= endDate as string);
    if (paymentMode) sales = sales.filter(s => s.paymentMode === paymentMode);
    res.json(sales.map(formatSale));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id);
    const sales = await db.select().from(salesTable)
      .where(and(eq(salesTable.id, id), eq(salesTable.userId, userId)));
    if (!sales[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatSale(sales[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { customerId, items, paymentMode, isGstInvoice = false, notes, date } = req.body;
    const saleDate = date || new Date().toISOString().split("T")[0];

    let customerName = "Walk-in Customer";
    let customer: any = null;
    if (customerId) {
      const customerRows = await db.select().from(customersTable)
        .where(and(eq(customersTable.id, customerId), eq(customersTable.userId, userId)));
      customer = customerRows[0];
      if (customer) customerName = customer.name;
    }

    let subtotal = 0;
    let totalGst = 0;
    const processedItems: any[] = [];

    for (const item of items) {
      const product = await db.select().from(productsTable)
        .where(and(eq(productsTable.id, item.productId), eq(productsTable.userId, userId)));
      if (!product[0]) continue;
      const gstAmt = isGstInvoice ? (item.sellingPrice * item.quantity * item.gstPercent) / 100 : 0;
      const itemTotal = item.sellingPrice * item.quantity + gstAmt;
      subtotal += item.sellingPrice * item.quantity;
      totalGst += gstAmt;
      processedItems.push({
        productId: item.productId,
        productName: product[0].name,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        gstPercent: item.gstPercent,
        gstAmount: gstAmt,
        totalAmount: itemTotal,
      });
      const newQty = parseFloat(product[0].stockQty) - item.quantity;
      await db.update(productsTable)
        .set({ stockQty: String(Math.max(0, newQty)) })
        .where(and(eq(productsTable.id, item.productId), eq(productsTable.userId, userId)));
    }

    const grandTotal = subtotal + totalGst;
    const invoiceNumber = getNextInvoice();

    const sale = await db.insert(salesTable).values({
      userId, invoiceNumber, customerId: customerId || null, customerName,
      items: processedItems, subtotal: String(subtotal), totalGst: String(totalGst),
      grandTotal: String(grandTotal), paymentMode, isGstInvoice, notes, date: saleDate,
    }).returning();

    if (paymentMode === "credit" && customer) {
      const currentBalance = parseFloat(customer.balance);
      const newBalance = currentBalance + grandTotal;
      await db.update(customersTable)
        .set({ balance: String(newBalance) })
        .where(and(eq(customersTable.id, customerId), eq(customersTable.userId, userId)));
      await db.insert(ledgerEntriesTable).values({
        userId, partyType: "customer", partyId: customerId,
        type: "sale", description: `Sale - Invoice ${invoiceNumber}`,
        debit: String(grandTotal), credit: "0", balance: String(newBalance),
        referenceId: sale[0].id, referenceType: "sale", date: saleDate,
      });
    }

    res.status(201).json(formatSale(sale[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatSale(s: any) {
  return {
    ...s,
    subtotal: parseFloat(s.subtotal || "0"),
    totalGst: parseFloat(s.totalGst || "0"),
    grandTotal: parseFloat(s.grandTotal || "0"),
    items: Array.isArray(s.items) ? s.items : JSON.parse(s.items || "[]"),
    createdAt: s.createdAt?.toISOString?.() || s.createdAt,
  };
}

export default router;
