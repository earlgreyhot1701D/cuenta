// Job: derive the invoice's grey email status line so it never claims a send that didn't happen.
import { formatStamp } from "@/lib/dates";

export function emailStatus(invoice: { emailSentAt: Date | null; emailLastFailedAt: Date | null }): string | null {
  const { emailSentAt, emailLastFailedAt } = invoice;
  if (emailSentAt) {
    const failedSince = emailLastFailedAt && emailLastFailedAt > emailSentAt;
    return `Sent ${formatStamp(emailSentAt)}${failedSince ? " · resend failed" : ""}`;
  }
  return emailLastFailedAt ? "Not sent" : null;
}
