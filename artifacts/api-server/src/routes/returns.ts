import { Router } from "express";
import { db } from "@workspace/db";
import { returnsTable, productsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const returns = await db.select().from(returnsTable)
      .where(eq(returnsTable.userId, userId))
      .orderBy(returnsTable.createdAt);
    res.json(returns.map(formatReturn));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { returnType, referenceId, productId, quantity, amount, refundMode = "none", reason, date } = req.body;
    const returnDate = date || new Date().toISOString().split("T")[0];

    const product = await db.select().from(productsTable)
      .where(and(eq(productsTable.id, productId), eq(productsTable.userId, userId)));
    if (!product[0]) return res.status(400).json({ error: "Product not found" });

    const currentQty = parseFloat(product[0].stockQty);
    let newQty = currentQty;
    if (returnType === "purchase_return") {
      newQty = currentQty - quantity;
    } else if (returnType === "sale_return") {
      newQty = currentQty + quantity;
    }
    await db.update(productsTable)
      .set({ stockQty: String(Math.max(0, newQty)) })
      .where(and(eq(productsTable.id, productId), eq(productsTable.userId, userId)));

    const ret = await db.insert(returnsTable).values({
      userId, returnType, referenceId, productId, productName: product[0].name,
      quantity: String(quantity), amount: String(amount), refundMode, reason, date: returnDate,
    }).returning();
    res.status(201).json(formatReturn(ret[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatReturn(r: any) {
  return {
    ...r,
    quantity: parseFloat(r.quantity || "0"),
    amount: parseFloat(r.amount || "0"),
    createdAt: r.createdAt?.toISOString?.() || r.createdAt,
  };
}

export default router;
