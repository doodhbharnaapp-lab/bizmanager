import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, suppliersTable, customersTable, ledgerEntriesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { partyType, partyId } = req.query;
    let payments = await db.select().from(paymentsTable).orderBy(paymentsTable.createdAt);
    if (partyType) payments = payments.filter(p => p.partyType === partyType);
    if (partyId) payments = payments.filter(p => p.partyId === parseInt(partyId as string));
    res.json(payments.map(formatPayment));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { partyType, partyId, amount, paymentMode, notes, date } = req.body;
    const payDate = date || new Date().toISOString().split("T")[0];

    let partyName = "";
    if (partyType === "supplier") {
      const s = await db.select().from(suppliersTable).where(eq(suppliersTable.id, partyId));
      if (!s[0]) return res.status(400).json({ error: "Supplier not found" });
      partyName = s[0].name;
      const current = parseFloat(s[0].balance);
      const newBal = Math.max(0, current - amount);
      await db.update(suppliersTable).set({ balance: String(newBal) }).where(eq(suppliersTable.id, partyId));
      await db.insert(ledgerEntriesTable).values({
        partyType: "supplier", partyId, type: "payment",
        description: `Payment via ${paymentMode}`,
        debit: String(amount), credit: "0", balance: String(newBal),
        referenceType: "payment", date: payDate,
      });
    } else if (partyType === "customer") {
      const c = await db.select().from(customersTable).where(eq(customersTable.id, partyId));
      if (!c[0]) return res.status(400).json({ error: "Customer not found" });
      partyName = c[0].name;
      const current = parseFloat(c[0].balance);
      const newBal = Math.max(0, current - amount);
      await db.update(customersTable).set({ balance: String(newBal) }).where(eq(customersTable.id, partyId));
      await db.insert(ledgerEntriesTable).values({
        partyType: "customer", partyId, type: "payment",
        description: `Payment received via ${paymentMode}`,
        debit: "0", credit: String(amount), balance: String(newBal),
        referenceType: "payment", date: payDate,
      });
    }

    const payment = await db.insert(paymentsTable).values({
      partyType, partyId, partyName, amount: String(amount), paymentMode, notes, date: payDate,
    }).returning();
    res.status(201).json(formatPayment(payment[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatPayment(p: any) {
  return { ...p, amount: parseFloat(p.amount || "0"), createdAt: p.createdAt?.toISOString?.() || p.createdAt };
}

export default router;
