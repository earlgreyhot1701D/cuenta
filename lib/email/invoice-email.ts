// Job: the invoice email template (edit the copy here until Handoff).
// Later (prd.md > Possible Later Enhancements > Overdue reminders): a reminder template reusing this PDF, not built yet.
import { addDays, formatLong } from "@/lib/dates";
import { formatUSD } from "@/lib/money";

export type InvoiceEmail = { subject: string; text: string; attachmentName: string };

export function attachmentName(number: string): string {
  return `Invoice-${number.replace(/[^A-Za-z0-9_-]/g, "_")}.pdf`;
}

export function buildInvoiceEmail(input: {
  number: string;
  cafeName: string;
  invoiceDate: string;
  totalCents: number;
}): InvoiceEmail {
  const due = formatLong(addDays(input.invoiceDate, 30));
  return {
    subject: `La Condesa Baking Company Invoice ${input.number}`,
    text: [
      `Hello ${input.cafeName},`,
      "",
      `Attached is invoice ${input.number} for ${formatUSD(input.totalCents)}, delivered ${formatLong(input.invoiceDate)}.`,
      `Payment is due by ${due} (Net 30).`,
      "",
      "Thank you!",
      "La Condesa Baking Company",
    ].join("\n"),
    attachmentName: attachmentName(input.number),
  };
}
