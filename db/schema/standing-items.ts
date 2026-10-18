// Job: define each cafe's standing product list.
import { integer, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { products } from "./products";

export const standingItems = pgTable(
  "standing_items",
  {
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    position: integer("position").notNull(),
  },
  (t) => [primaryKey({ columns: [t.customerId, t.productId] })],
);
