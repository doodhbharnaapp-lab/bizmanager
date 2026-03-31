import { Router } from "express";
import { db } from "@workspace/db";
import { salesTable, purchasesTable, customersTable, suppliersTable, productsTable } from "@workspace/db/schema";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/summary", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const monthStart = today.substring(0, 7) + "-01";

    const sales = await db.select().from(salesTable);
    const purchases = await db.select().from(purchasesTable);
    const customers = await db.select().from(customersTable);
    const suppliers = await db.select().from(suppliersTable);
    const products = await db.select().from(productsTable);

    const todaySales = sales.filter(s => s.date === today).reduce((sum, s) => sum + parseFloat(s.grandTotal), 0);
    const todayPurchases = purchases.filter(p => p.date === today).reduce((sum, p) => sum + parseFloat(p.grandTotal), 0);
    const monthSales = sales.filter(s => s.date >= monthStart).reduce((sum, s) => sum + parseFloat(s.grandTotal), 0);
    const monthPurchases = purchases.filter(p => p.date >= monthStart).reduce((sum, p) => sum + parseFloat(p.grandTotal), 0);

    const totalSalesCost = sales.reduce((sum, s) => {
      const items = Array.isArray(s.items) ? s.items : JSON.parse(s.items as string || "[]");
      return sum + items.reduce((is: number, i: any) => is + (i.quantity * i.sellingPrice * 0.7), 0);
    }, 0);
    const grossProfit = monthSales - monthPurchases;

    const pendingFromCustomers = customers.reduce((s, c) => s + parseFloat(c.balance), 0);
    const pendingToSuppliers = suppliers.reduce((s, sup) => s + parseFloat(sup.balance), 0);
    const lowStockCount = products.filter(p => parseFloat(p.stockQty) <= parseFloat(p.lowStockThreshold || "10")).length;

    res.json({
      todaySales,
      todayPurchases,
      totalSalesThisMonth: monthSales,
      totalPurchasesThisMonth: monthPurchases,
      grossProfit,
      pendingFromCustomers,
      pendingToSuppliers,
      lowStockCount,
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalSuppliers: suppliers.length,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/trends", async (req, res) => {
  try {
    const period = (req.query.period as string) || "monthly";
    const sales = await db.select().from(salesTable);
    const purchases = await db.select().from(purchasesTable);
    const trendsMap: Record<string, { sales: number; purchases: number }> = {};

    for (const s of sales) {
      const label = period === "daily" ? s.date : period === "monthly" ? s.date.substring(0, 7) : s.date.substring(0, 4);
      if (!trendsMap[label]) trendsMap[label] = { sales: 0, purchases: 0 };
      trendsMap[label].sales += parseFloat(s.grandTotal);
    }
    for (const p of purchases) {
      const label = period === "daily" ? p.date : period === "monthly" ? p.date.substring(0, 7) : p.date.substring(0, 4);
      if (!trendsMap[label]) trendsMap[label] = { sales: 0, purchases: 0 };
      trendsMap[label].purchases += parseFloat(p.grandTotal);
    }

    const result = Object.entries(trendsMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([label, data]) => ({
        label,
        sales: data.sales,
        purchases: data.purchases,
        profit: data.sales - data.purchases,
      }));

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
