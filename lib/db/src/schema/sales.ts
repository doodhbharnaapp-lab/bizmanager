import { pgTable, serial, varchar, numeric, timestamp, integer, text, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const salesTable = pgTable("sales", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(0),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull().unique(),
  customerId: integer("customer_id"),
  customerName: varchar("customer_name", { length: 255 }),
  items: jsonb("items").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  totalGst: numeric("total_gst", { precision: 12, scale: 2 }).notNull().default("0"),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),
  paymentMode: varchar("payment_mode", { length: 50 }).notNull(),
  isGstInvoice: boolean("is_gst_invoice").notNull().default(false),
  notes: text("notes"),
  date: varchar("date", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSaleSchema = createInsertSchema(salesTable).omit({ id: true, createdAt: true });
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof salesTable.$inferSelect;
