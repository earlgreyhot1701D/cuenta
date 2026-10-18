// Job: work out each ledger row's due date, overdue days and status, and the Open / Outstanding / This month stats.
import { addDays, daysBetween } from "@/lib/dates";

export const NET_DAYS = 30;

export type LedgerInvoice = {
  invoiceDate: string;
  totalCents: number;
  paidOn: string | null;
  voidedAt: Date | null;
};

export type LedgerStatus = "unpaid" | "paid" | "void";

export function rowState(invoice: LedgerInvoice, today: string) {
  const status: LedgerStatus = invoice.voidedAt ? "void" : invoice.paidOn ? "paid" : "unpaid";
  const dueOn = addDays(invoice.invoiceDate, NET_DAYS);
  const late = daysBetween(dueOn, today);
  return { status, dueOn, overdueDays: status === "unpaid" && late > 0 ? late : 0 };
}

/**
 * Open and Outstanding: unpaid, non-void invoices.
 * This month: non-void invoices whose delivery date falls in today's Pacific month, paid or not.
 */
export function ledgerStats(invoices: LedgerInvoice[], today: string) {
  const month = today.slice(0, 7);
  let open = 0;
  let outstandingCents = 0;
  let thisMonthCents = 0;
  for (const invoice of invoices) {
    if (invoice.voidedAt) continue;
    if (!invoice.paidOn) {
      open += 1;
      outstandingCents += invoice.totalCents;
    }
    if (invoice.invoiceDate.slice(0, 7) === month) thisMonthCents += invoice.totalCents;
  }
  return { open, outstandingCents, thisMonthCents };
}
