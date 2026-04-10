import { Router } from "express";
import { db } from "@workspace/db";
import { suppliersTable, ledgerEntriesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { search } = req.query;
    let suppliers = await db.select().from(suppliersTable)
      .where(eq(suppliersTable.userId, userId))
      .orderBy(suppliersTable.name);
    if (search) {
      const q = (search as string).toLowerCase();
      suppliers = suppliers.filter(s => s.name.toLowerCase().includes(q));
    }
    res.json(suppliers.map(formatSupplier));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id);
    const suppliers = await db.select().from(suppliersTable)
      .where(and(eq(suppliersTable.id, id), eq(suppliersTable.userId, userId)));
    if (!suppliers[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatSupplier(suppliers[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { name, phone, email, address, gstNumber } = req.body;
    const result = await db.insert(suppliersTable)
      .values({ userId, name, phone, email, address, gstNumber })
      .returning();
    res.status(201).json(formatSupplier(result[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id);
    const { name, phone, email, address, gstNumber } = req.body;
    const result = await db.update(suppliersTable)
      .set({ name, phone, email, address, gstNumber })
      .where(and(eq(suppliersTable.id, id), eq(suppliersTable.userId, userId)))
      .returning();
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatSupplier(result[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id);
    await db.delete(suppliersTable)
      .where(and(eq(suppliersTable.id, id), eq(suppliersTable.userId, userId)));
    res.json({ message: "Deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/ledger", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const partyId = parseInt(req.params.id);
    const entries = await db.select().from(ledgerEntriesTable)
      .where(and(
        eq(ledgerEntriesTable.userId, userId),
        eq(ledgerEntriesTable.partyType, "supplier"),
        eq(ledgerEntriesTable.partyId, partyId)
      ))
      .orderBy(ledgerEntriesTable.date, ledgerEntriesTable.createdAt);
    const formatted = entries.map(formatLedgerEntry);
    const totalDebit = formatted.reduce((s, e) => s + e.debit, 0);
    const totalCredit = formatted.reduce((s, e) => s + e.credit, 0);
    const closingBalance = formatted.length > 0 ? formatted[formatted.length - 1].balance : 0;
    res.json({ entries: formatted, openingBalance: 0, closingBalance, totalDebit, totalCredit });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatSupplier(s: any) {
  return { ...s, balance: parseFloat(s.balance || "0"), createdAt: s.createdAt?.toISOString?.() || s.createdAt };
}

function formatLedgerEntry(e: any) {
  return {
    ...e,
    debit: parseFloat(e.debit || "0"),
    credit: parseFloat(e.credit || "0"),
    balance: parseFloat(e.balance || "0"),
    createdAt: e.createdAt?.toISOString?.() || e.createdAt,
  };
}

export default router;
