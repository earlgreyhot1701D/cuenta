// Job: define the append-only shelf counts table.
import { check, date, index, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { customers } from "./customers";
import { products } from "./products";

export const counts = pgTable(
  "counts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull(),
    countedOn: date("counted_on").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("counts_quantity_nonneg", sql`${t.quantity} >= 0`),
    index("counts_latest_idx").on(t.customerId, t.productId, t.countedOn, t.createdAt),
  ],
);
