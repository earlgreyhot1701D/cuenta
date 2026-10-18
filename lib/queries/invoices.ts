// Job: read and write invoice snapshots and their lines.
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import type { Customer } from "./customers";

export type Invoice = typeof schema.invoices.$inferSelect;
export type InvoiceLine = typeof schema.invoiceLines.$inferSelect;
export type NewLine = { productId: string | null; description: string; unitPriceCents: number; quantity: number };

/** Thrown when the invoice number is already taken. */
export class DuplicateNumberError extends Error {
  constructor(public existing: Pick<Invoice, "invoiceDate" | "cafeName">) {
    super("Duplicate invoice number");
  }
}

export async function findByNumber(number: string): Promise<Invoice | undefined> {
  const [row] = await db.select().from(schema.invoices).where(eq(schema.invoices.number, number));
  return row;
}

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

/** Saves the invoice with the cafe's details and the lines copied on, in one transaction. */
export async function createInvoice(input: {
  customer: Customer;
  invoiceDate: string;
  number: string;
  lines: NewLine[];
}): Promise<string> {
  const { customer, invoiceDate, number, lines } = input;
  try {
    return await db.transaction(async (tx) => {
      const [invoice] = await tx
        .insert(schema.invoices)
        .values({
          number,
          customerId: customer.id,
          invoiceDate,
          cafeName: customer.name,
          cafePhone: customer.phone,
          cafeAddressLines: customer.addressLines,
          cafeEmail: customer.billingEmail,
          cafeLogoPath: customer.logoPath,
        })
        .returning({ id: schema.invoices.id });
      await tx
        .insert(schema.invoiceLines)
        .values(lines.map((line, position) => ({ ...line, invoiceId: invoice.id, position })));
      return invoice.id;
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      const existing = await findByNumber(number);
      if (existing) throw new DuplicateNumberError(existing);
    }
    throw err;
  }
}

export async function getInvoice(id: string): Promise<{ invoice: Invoice; lines: InvoiceLine[] } | undefined> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const [invoice] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
  if (!invoice) return undefined;
  const lines = await db
    .select()
    .from(schema.invoiceLines)
    .where(eq(schema.invoiceLines.invoiceId, id))
    .orderBy(asc(schema.invoiceLines.position));
  return { invoice, lines };
}

/** A successful send: stamp it, keep its message id, and clear any earlier failure. */
export async function markEmailSent(id: string, messageId: string): Promise<void> {
  await db
    .update(schema.invoices)
    .set({ emailSentAt: new Date(), emailMessageId: messageId, emailLastFailedAt: null, updatedAt: new Date() })
    .where(eq(schema.invoices.id, id));
}

/** A failed send: record it without touching an earlier successful send. */
export async function markEmailFailed(id: string): Promise<void> {
  await db
    .update(schema.invoices)
    .set({ emailLastFailedAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.invoices.id, id));
}
