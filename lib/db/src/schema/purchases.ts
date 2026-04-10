import { pgTable, serial, varchar, numeric, timestamp, integer, text, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const purchasesTable = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(0),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull().unique(),
  supplierId: integer("supplier_id").notNull(),
  supplierName: varchar("supplier_name", { length: 255 }).notNull(),
  items: jsonb("items").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  totalGst: numeric("total_gst", { precision: 12, scale: 2 }).notNull().default("0"),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),
  paymentMode: varchar("payment_mode", { length: 50 }).notNull(),
  notes: text("notes"),
  date: varchar("date", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPurchaseSchema = createInsertSchema(purchasesTable).omit({ id: true, createdAt: true });
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchasesTable.$inferSelect;
