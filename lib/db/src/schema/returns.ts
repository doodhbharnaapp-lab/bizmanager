import { pgTable, serial, varchar, numeric, timestamp, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const returnsTable = pgTable("returns", {
  id: serial("id").primaryKey(),
  returnType: varchar("return_type", { length: 50 }).notNull(),
  referenceId: integer("reference_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  refundMode: varchar("refund_mode", { length: 50 }).notNull().default("none"),
  reason: text("reason"),
  date: varchar("date", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReturnSchema = createInsertSchema(returnsTable).omit({ id: true, createdAt: true });
export type InsertReturn = z.infer<typeof insertReturnSchema>;
export type Return = typeof returnsTable.$inferSelect;
