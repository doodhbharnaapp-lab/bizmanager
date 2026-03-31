import { pgTable, serial, varchar, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).notNull(),
  sellingPrice: numeric("selling_price", { precision: 12, scale: 2 }).notNull(),
  gstPercent: numeric("gst_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  rack: varchar("rack", { length: 100 }),
  stockQty: numeric("stock_qty", { precision: 12, scale: 3 }).notNull().default("0"),
  lowStockThreshold: numeric("low_stock_threshold", { precision: 12, scale: 3 }).default("10"),
  unit: varchar("unit", { length: 50 }).default("pcs"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
