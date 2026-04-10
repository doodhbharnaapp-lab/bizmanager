import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { search, category, lowStock } = req.query;
    let products = await db.select().from(productsTable)
      .where(eq(productsTable.userId, userId))
      .orderBy(productsTable.name);
    if (search) {
      const q = (search as string).toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q));
    }
    if (category) {
      products = products.filter(p => p.category === category);
    }
    if (lowStock === "true") {
      products = products.filter(p => parseFloat(p.stockQty) <= parseFloat(p.lowStockThreshold || "10"));
    }
    res.json(products.map(formatProduct));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id);
    const products = await db.select().from(productsTable)
      .where(and(eq(productsTable.id, id), eq(productsTable.userId, userId)));
    if (!products[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatProduct(products[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { name, category, purchasePrice, sellingPrice, gstPercent = 0, rack, stockQty = 0, lowStockThreshold = 10, unit = "pcs" } = req.body;
    const result = await db.insert(productsTable).values({
      userId, name, category,
      purchasePrice: String(purchasePrice), sellingPrice: String(sellingPrice),
      gstPercent: String(gstPercent), rack, stockQty: String(stockQty),
      lowStockThreshold: String(lowStockThreshold), unit,
    }).returning();
    res.status(201).json(formatProduct(result[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id);
    const { name, category, purchasePrice, sellingPrice, gstPercent, rack, stockQty, lowStockThreshold, unit } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (purchasePrice !== undefined) updates.purchasePrice = String(purchasePrice);
    if (sellingPrice !== undefined) updates.sellingPrice = String(sellingPrice);
    if (gstPercent !== undefined) updates.gstPercent = String(gstPercent);
    if (rack !== undefined) updates.rack = rack;
    if (stockQty !== undefined) updates.stockQty = String(stockQty);
    if (lowStockThreshold !== undefined) updates.lowStockThreshold = String(lowStockThreshold);
    if (unit !== undefined) updates.unit = unit;
    const result = await db.update(productsTable).set(updates)
      .where(and(eq(productsTable.id, id), eq(productsTable.userId, userId)))
      .returning();
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatProduct(result[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id);
    await db.delete(productsTable)
      .where(and(eq(productsTable.id, id), eq(productsTable.userId, userId)));
    res.json({ message: "Deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/adjust", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id);
    const { adjustment } = req.body;
    const products = await db.select().from(productsTable)
      .where(and(eq(productsTable.id, id), eq(productsTable.userId, userId)));
    if (!products[0]) return res.status(404).json({ error: "Not found" });
    const current = parseFloat(products[0].stockQty);
    const newQty = current + parseFloat(adjustment);
    const result = await db.update(productsTable)
      .set({ stockQty: String(newQty) })
      .where(and(eq(productsTable.id, id), eq(productsTable.userId, userId)))
      .returning();
    res.json(formatProduct(result[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatProduct(p: any) {
  return {
    ...p,
    purchasePrice: parseFloat(p.purchasePrice),
    sellingPrice: parseFloat(p.sellingPrice),
    gstPercent: parseFloat(p.gstPercent || "0"),
    stockQty: parseFloat(p.stockQty || "0"),
    lowStockThreshold: parseFloat(p.lowStockThreshold || "10"),
    createdAt: p.createdAt?.toISOString?.() || p.createdAt,
  };
}

export default router;
