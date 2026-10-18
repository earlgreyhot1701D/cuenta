// Job: check the email status line never lies, and the template fills in the right numbers.
import { describe, expect, it } from "vitest";
import { emailStatus } from "@/lib/email-status";
import { buildInvoiceEmail } from "@/lib/email/invoice-email";

const at = (iso: string) => new Date(iso);

describe("emailStatus", () => {
  it("says nothing when no send was attempted", () => {
    expect(emailStatus({ emailSentAt: null, emailLastFailedAt: null })).toBeNull();
  });
  it("stamps a successful send in Pacific time", () => {
    expect(emailStatus({ emailSentAt: at("2026-10-18T16:14:00Z"), emailLastFailedAt: null })).toBe("Sent Oct 18 9:14am");
  });
  it("keeps Sent after a later failed resend, and says so", () => {
    expect(emailStatus({ emailSentAt: at("2026-10-18T16:14:00Z"), emailLastFailedAt: at("2026-10-19T16:00:00Z") })).toBe(
      "Sent Oct 18 9:14am · resend failed",
    );
  });
  it("says Not sent only when no send ever succeeded", () => {
    expect(emailStatus({ emailSentAt: null, emailLastFailedAt: at("2026-10-18T16:14:00Z") })).toBe("Not sent");
  });
});

describe("buildInvoiceEmail", () => {
  it("fills the subject, total and Net 30 due date", () => {
    const email = buildInvoiceEmail({ number: "110172026", cafeName: "Corazon Cocina", invoiceDate: "2026-10-17", totalCents: 9700 });
    expect(email.subject).toBe("La Condesa Baking Company Invoice 110172026");
    expect(email.text).toContain("$97.00");
    expect(email.text).toContain("Payment is due by November 16, 2026");
    expect(email.attachmentName).toBe("Invoice-110172026.pdf");
  });
});
