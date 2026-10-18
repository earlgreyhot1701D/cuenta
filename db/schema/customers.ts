// Job: define the customers (cafes) table.
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: integer("code").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  addressLines: text("address_lines").array().notNull(),
  billingEmail: text("billing_email"),
  logoPath: text("logo_path"),
  sort: integer("sort").notNull(),
});
