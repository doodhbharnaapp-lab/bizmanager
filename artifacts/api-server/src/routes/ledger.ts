import { Router } from "express";
import { db } from "@workspace/db";
import { ledgerEntriesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { partyType, partyId, startDate, endDate } = req.query;
    let entries = await db.select().from(ledgerEntriesTable)
      .where(eq(ledgerEntriesTable.userId, userId))
      .orderBy(ledgerEntriesTable.date, ledgerEntriesTable.createdAt);
    if (partyType) entries = entries.filter(e => e.partyType === partyType);
    if (partyId) entries = entries.filter(e => e.partyId === parseInt(partyId as string));
    if (startDate) entries = entries.filter(e => e.date >= startDate as string);
    if (endDate) entries = entries.filter(e => e.date <= endDate as string);
    const formatted = entries.map(formatEntry);
    const totalDebit = formatted.reduce((s, e) => s + e.debit, 0);
    const totalCredit = formatted.reduce((s, e) => s + e.credit, 0);
    const closingBalance = formatted.length > 0 ? formatted[formatted.length - 1].balance : 0;
    res.json({ entries: formatted, openingBalance: 0, closingBalance, totalDebit, totalCredit });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatEntry(e: any) {
  return {
    ...e,
    debit: parseFloat(e.debit || "0"),
    credit: parseFloat(e.credit || "0"),
    balance: parseFloat(e.balance || "0"),
    createdAt: e.createdAt?.toISOString?.() || e.createdAt,
  };
}

export default router;
