// Job: define the invoices table, with the cafe details copied on as a snapshot.
import { boolean, date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { customers } from "./customers";

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: text("number").notNull().unique(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  invoiceDate: date("invoice_date").notNull(),
  cafeName: text("cafe_name").notNull(),
  cafePhone: text("cafe_phone").notNull(),
  cafeAddressLines: text("cafe_address_lines").array().notNull(),
  cafeEmail: text("cafe_email"),
  cafeLogoPath: text("cafe_logo_path"),
  voidedAt: timestamp("voided_at", { withTimezone: true }),
  paidOn: date("paid_on"),
  paidReference: text("paid_reference"),
  emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
  emailMessageId: text("email_message_id"),
  /** The last successful send went to the EMAIL_TEST_TO inbox, not the cafe. */
  emailLastSentTest: boolean("email_last_sent_test").notNull().default(false),
  emailLastFailedAt: timestamp("email_last_failed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
