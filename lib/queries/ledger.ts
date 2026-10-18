// Job: read invoices for the Ledger with their totals summed from their lines.
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db/client";

export type LedgerRecord = {
  id: string;
  number: string;
  customerId: string;
  cafeName: string;
  invoiceDate: string;
  totalCents: number;
  paidOn: string | null;
  paidReference: string | null;
  voidedAt: Date | null;
  emailSentAt: Date | null;
};

export async function listLedger(customerId?: string): Promise<LedgerRecord[]> {
  const { invoices, invoiceLines } = schema;
  const rows = await db
    .select({
      id: invoices.id,
      number: invoices.number,
      customerId: invoices.customerId,
      cafeName: invoices.cafeName,
      invoiceDate: invoices.invoiceDate,
      totalCents: sql<number>`coalesce(sum(${invoiceLines.unitPriceCents} * ${invoiceLines.quantity}), 0)::int`,
      paidOn: invoices.paidOn,
      paidReference: invoices.paidReference,
      voidedAt: invoices.voidedAt,
      emailSentAt: invoices.emailSentAt,
    })
    .from(invoices)
    .leftJoin(invoiceLines, eq(invoiceLines.invoiceId, invoices.id))
    .where(customerId ? eq(invoices.customerId, customerId) : undefined)
    .groupBy(invoices.id)
    .orderBy(desc(invoices.invoiceDate), desc(invoices.createdAt));
  return rows;
}

export async function setPayment(id: string, paidOn: string, reference: string | null): Promise<void> {
  await db
    .update(schema.invoices)
    .set({ paidOn, paidReference: reference, updatedAt: new Date() })
    .where(eq(schema.invoices.id, id));
}

export async function clearPayment(id: string): Promise<void> {
  await db
    .update(schema.invoices)
    .set({ paidOn: null, paidReference: null, updatedAt: new Date() })
    .where(eq(schema.invoices.id, id));
}
