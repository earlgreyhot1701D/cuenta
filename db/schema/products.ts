// Job: define the products table.
import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  active: boolean("active").notNull().default(true),
});
