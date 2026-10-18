// Job: the words for an invoice's email state, the same on the Invoice page, the Email pop-up and the Ledger; never claiming a send that didn't happen.
import { formatShort, formatStamp, todayPacific } from "@/lib/dates";

type EmailState = { emailSentAt: Date | null; emailLastFailedAt: Date | null };

function failedSinceSent({ emailSentAt, emailLastFailedAt }: EmailState): boolean {
  return !!emailSentAt && !!emailLastFailedAt && emailLastFailedAt > emailSentAt;
}

/** Invoice page and Email pop-up: "Last sent Oct 17, 8:12pm", "Not sent", or nothing if never tried. */
export function emailStatus(invoice: EmailState): string | null {
  if (invoice.emailSentAt) {
    return `Last sent ${formatStamp(invoice.emailSentAt)}${failedSinceSent(invoice) ? " · last try failed" : ""}`;
  }
  return invoice.emailLastFailedAt ? "Not sent" : null;
}

/** Ledger: a short label beside the envelope ("Emailed Oct 17") and the full one for the tooltip and screen readers. */
export function emailLabel(invoice: EmailState): { short: string; full: string } | null {
  if (invoice.emailSentAt) {
    const failed = failedSinceSent(invoice) ? " · last try failed" : "";
    return {
      short: `Emailed ${formatShort(todayPacific(invoice.emailSentAt))}${failed}`,
      full: `Emailed ${formatStamp(invoice.emailSentAt)}${failed}`,
    };
  }
  return invoice.emailLastFailedAt ? { short: "Not sent", full: "Not sent: the last try failed" } : null;
}

/** The send button's words: never "Resend", which is also our email provider's name. */
export function sendButtonLabel(invoice: EmailState): string {
  return invoice.emailSentAt ? "Send again" : "Send email";
}
