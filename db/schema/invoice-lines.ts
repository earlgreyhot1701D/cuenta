// Job: define the invoice lines table; each line keeps its own description and price.
import { check, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { invoices } from "./invoices";
import { products } from "./products";

export const invoiceLines = pgTable(
  "invoice_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id),
    productId: uuid("product_id").references(() => products.id),
    description: text("description").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
    position: integer("position").notNull(),
  },
  (t) => [
    check("invoice_lines_price_nonneg", sql`${t.unitPriceCents} >= 0`),
    check("invoice_lines_quantity_pos", sql`${t.quantity} >= 1`),
  ],
);
