// Job: check the ledger stats and row states against the PRD's rules.
import { describe, expect, it } from "vitest";
import { ledgerStats, rowState, type LedgerInvoice } from "@/lib/ledger-stats";

const TODAY = "2026-10-17";
const inv = (p: Partial<LedgerInvoice>): LedgerInvoice => ({
  invoiceDate: "2026-10-17",
  totalCents: 0,
  paidOn: null,
  voidedAt: null,
  ...p,
});

describe("ledgerStats", () => {
  it("counts the two production test invoices in all three stats", () => {
    expect(ledgerStats([inv({ totalCents: 9700 }), inv({ totalCents: 12800 })], TODAY)).toEqual({
      open: 2,
      outstandingCents: 22500,
      thisMonthCents: 22500,
    });
  });
  it("drops a paid invoice from Open and Outstanding but keeps it in This month", () => {
    expect(ledgerStats([inv({ totalCents: 9700, paidOn: "2026-10-20" }), inv({ totalCents: 12800 })], TODAY)).toEqual({
      open: 1,
      outstandingCents: 12800,
      thisMonthCents: 22500,
    });
  });
  it("leaves void invoices out of every stat", () => {
    expect(ledgerStats([inv({ totalCents: 9700, voidedAt: new Date() })], TODAY)).toEqual({
      open: 0,
      outstandingCents: 0,
      thisMonthCents: 0,
    });
  });
  it("counts This month by delivery date in the Pacific month, not by payment date", () => {
    const sept = inv({ invoiceDate: "2026-09-30", totalCents: 5000, paidOn: "2026-10-02" });
    expect(ledgerStats([sept], TODAY).thisMonthCents).toBe(0);
    expect(ledgerStats([inv({ invoiceDate: "2026-10-01", totalCents: 5000 })], TODAY).thisMonthCents).toBe(5000);
  });
  it("is all zeros with no invoices", () => {
    expect(ledgerStats([], TODAY)).toEqual({ open: 0, outstandingCents: 0, thisMonthCents: 0 });
  });
});

describe("rowState", () => {
  it("is due 30 days after delivery and not overdue on the due date", () => {
    expect(rowState(inv({}), TODAY)).toEqual({ status: "unpaid", dueOn: "2026-11-16", overdueDays: 0 });
    expect(rowState(inv({ invoiceDate: "2026-09-17" }), TODAY).overdueDays).toBe(0);
  });
  it("counts overdue days for unpaid invoices only", () => {
    expect(rowState(inv({ invoiceDate: "2026-09-08" }), TODAY)).toMatchObject({ status: "unpaid", overdueDays: 9 });
    expect(rowState(inv({ invoiceDate: "2026-09-08", paidOn: "2026-10-01" }), TODAY)).toMatchObject({ status: "paid", overdueDays: 0 });
    expect(rowState(inv({ invoiceDate: "2026-09-08", voidedAt: new Date() }), TODAY)).toMatchObject({ status: "void", overdueDays: 0 });
  });
});
