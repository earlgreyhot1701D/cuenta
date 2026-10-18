// Job: define the products table: one menu, the same products and prices for every cafe.
import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  active: boolean("active").notNull().default(true),
  /** Menu order on Count, Deliver, Customers and Past counts. */
  sort: integer("sort").notNull().default(0),
});
