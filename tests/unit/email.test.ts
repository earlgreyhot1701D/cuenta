// Job: check the email status line never lies, and the template fills in the right numbers.
import { describe, expect, it } from "vitest";
import { emailLabel, emailStatus, sendButtonLabel } from "@/lib/email-status";
import { buildInvoiceEmail } from "@/lib/email/invoice-email";

const at = (iso: string) => new Date(iso);

describe("email status words", () => {
  const sent = at("2026-10-18T03:12:00Z"); // Oct 17, 8:12pm Pacific
  it("says nothing when no send was attempted", () => {
    expect(emailStatus({ emailSentAt: null, emailLastFailedAt: null })).toBeNull();
    expect(emailLabel({ emailSentAt: null, emailLastFailedAt: null })).toBeNull();
  });
  it("uses Last sent / Emailed with the Pacific date and time", () => {
    expect(emailStatus({ emailSentAt: sent, emailLastFailedAt: null })).toBe("Last sent Oct 17, 8:12pm");
    expect(emailLabel({ emailSentAt: sent, emailLastFailedAt: null })).toEqual({ short: "Emailed Oct 17", full: "Emailed Oct 17, 8:12pm" });
  });
  it("keeps the earlier send after a failed retry, and says the retry failed", () => {
    const failed = at("2026-10-19T16:00:00Z");
    expect(emailStatus({ emailSentAt: sent, emailLastFailedAt: failed })).toBe("Last sent Oct 17, 8:12pm · last try failed");
    expect(emailLabel({ emailSentAt: sent, emailLastFailedAt: failed })?.short).toBe("Emailed Oct 17 · last try failed");
  });
  it("says Not sent only when no send ever succeeded", () => {
    expect(emailStatus({ emailSentAt: null, emailLastFailedAt: sent })).toBe("Not sent");
    expect(emailLabel({ emailSentAt: null, emailLastFailedAt: sent })?.short).toBe("Not sent");
  });
  it("never labels the button Resend", () => {
    expect(sendButtonLabel({ emailSentAt: null, emailLastFailedAt: null })).toBe("Send email");
    expect(sendButtonLabel({ emailSentAt: sent, emailLastFailedAt: null })).toBe("Send again");
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
