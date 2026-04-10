import { Router } from "express";
import { db } from "@workspace/db";
import { salesTable, purchasesTable, productsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/profit-loss", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { startDate, endDate, groupBy = "overall" } = req.query;
    let sales = await db.select().from(salesTable).where(eq(salesTable.userId, userId));
    let purchases = await db.select().from(purchasesTable).where(eq(purchasesTable.userId, userId));
    if (startDate) { sales = sales.filter(s => s.date >= startDate as string); purchases = purchases.filter(p => p.date >= startDate as string); }
    if (endDate) { sales = sales.filter(s => s.date <= endDate as string); purchases = purchases.filter(p => p.date <= endDate as string); }

    const totalRevenue = sales.reduce((s, sale) => s + parseFloat(sale.grandTotal), 0);
    const totalCost = purchases.reduce((s, p) => s + parseFloat(p.grandTotal), 0);
    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    let items: any[] = [];
    if (groupBy === "product") {
      const productMap: Record<number, { revenue: number; cost: number; name: string }> = {};
      for (const sale of sales) {
        const saleItems = Array.isArray(sale.items) ? sale.items : JSON.parse(sale.items as string || "[]");
        for (const item of saleItems) {
          if (!productMap[item.productId]) productMap[item.productId] = { revenue: 0, cost: 0, name: item.productName };
          productMap[item.productId].revenue += item.totalAmount;
        }
      }
      for (const purchase of purchases) {
        const purItems = Array.isArray(purchase.items) ? purchase.items : JSON.parse(purchase.items as string || "[]");
        for (const item of purItems) {
          if (!productMap[item.productId]) productMap[item.productId] = { revenue: 0, cost: 0, name: item.productName };
          productMap[item.productId].cost += item.totalAmount;
        }
      }
      items = Object.entries(productMap).map(([id, d]) => ({
        label: d.name, revenue: d.revenue, cost: d.cost,
        profit: d.revenue - d.cost, margin: d.revenue > 0 ? ((d.revenue - d.cost) / d.revenue) * 100 : 0,
      }));
    }

    res.json({ totalRevenue, totalCost, grossProfit, profitMargin, items, totalSalesCount: sales.length, totalPurchasesCount: purchases.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stock", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const products = await db.select().from(productsTable)
      .where(eq(productsTable.userId, userId))
      .orderBy(productsTable.name);
    res.json(products.map(p => ({
      id: p.id, name: p.name, category: p.category, rack: p.rack,
      stockQty: parseFloat(p.stockQty || "0"),
      lowStockThreshold: parseFloat(p.lowStockThreshold || "10"),
      purchasePrice: parseFloat(p.purchasePrice),
      sellingPrice: parseFloat(p.sellingPrice),
      stockValue: parseFloat(p.stockQty || "0") * parseFloat(p.purchasePrice),
      isLowStock: parseFloat(p.stockQty || "0") <= parseFloat(p.lowStockThreshold || "10"),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/top-products", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 10;
    const sales = await db.select().from(salesTable).where(eq(salesTable.userId, userId));
    const purchases = await db.select().from(purchasesTable).where(eq(purchasesTable.userId, userId));
    const productMap: Record<number, { name: string; category: string; totalSold: number; totalRevenue: number; totalCost: number }> = {};

    for (const sale of sales) {
      const items = Array.isArray(sale.items) ? sale.items : JSON.parse(sale.items as string || "[]");
      for (const item of items) {
        if (!productMap[item.productId]) productMap[item.productId] = { name: item.productName, category: "", totalSold: 0, totalRevenue: 0, totalCost: 0 };
        productMap[item.productId].totalSold += item.quantity;
        productMap[item.productId].totalRevenue += item.totalAmount;
      }
    }
    for (const purchase of purchases) {
      const items = Array.isArray(purchase.items) ? purchase.items : JSON.parse(purchase.items as string || "[]");
      for (const item of items) {
        if (!productMap[item.productId]) productMap[item.productId] = { name: item.productName, category: "", totalSold: 0, totalRevenue: 0, totalCost: 0 };
        productMap[item.productId].totalCost += item.totalAmount;
      }
    }

    const result = Object.entries(productMap)
      .map(([id, d]) => ({ id: parseInt(id), name: d.name, category: d.category, totalSold: d.totalSold, totalRevenue: d.totalRevenue, totalProfit: d.totalRevenue - d.totalCost }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
