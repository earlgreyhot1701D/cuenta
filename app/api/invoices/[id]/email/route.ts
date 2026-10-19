// Job: render the invoice PDF and email it via Resend, recording success or failure on the invoice.
import { NextResponse } from "next/server";
import { HttpError, withRoute } from "@/lib/api/with-route";
import { buildInvoiceEmail } from "@/lib/email/invoice-email";
import { sendEmail } from "@/lib/email/send";
import { emailTestTo } from "@/lib/email/test-mode";
import { lineTotal, sumCents } from "@/lib/money";
import { printBaseUrl, renderInvoicePdf } from "@/lib/pdf/render-invoice-pdf";
import { getInvoice, markEmailFailed, markEmailSent } from "@/lib/queries/invoices";

export const maxDuration = 60;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FAILED = "Couldn't send. The invoice is saved. Try again or print it.";

export const POST = withRoute<{ params: Promise<{ id: string }> }>(
  "POST /api/invoices/[id]/email",
  async (req, { params }, logCtx) => {
    const found = await getInvoice((await params).id);
    if (!found) throw new HttpError(404, "That invoice wasn't found.");
    const { invoice, lines } = found;
    logCtx.invoiceNumber = invoice.number;
    logCtx.cafe = invoice.cafeName;
    if (invoice.voidedAt) throw new HttpError(409, "A void invoice can't be emailed.");

    // The recipient is used for this send only; it never changes the customer record and is never logged.
    const body = await req.json().catch(() => ({}));
    const to = typeof body.to === "string" ? body.to.trim() : "";
    // In test mode sendEmail replaces the recipient, so To may be blank (a cafe with no email on file).
    if (!emailTestTo() && !EMAIL_PATTERN.test(to)) throw new HttpError(400, "Check the email address.");

    const email = buildInvoiceEmail({
      number: invoice.number,
      cafeName: invoice.cafeName,
      invoiceDate: invoice.invoiceDate,
      totalCents: sumCents(lines.map((l) => lineTotal(l.unitPriceCents, l.quantity))),
    });

    try {
      const pdf = await renderInvoicePdf(invoice.id, printBaseUrl(req.url));
      const { messageId, test } = await sendEmail({
        to,
        subject: email.subject,
        text: email.text,
        attachment: { filename: email.attachmentName, content: pdf },
      });
      await markEmailSent(invoice.id, messageId, test);
      logCtx.messageId = messageId;
      if (test) logCtx.test = true;
      return NextResponse.json({ ok: true, messageId });
    } catch (err) {
      await markEmailFailed(invoice.id);
      throw new HttpError(502, FAILED, undefined, err instanceof Error ? err.message.slice(0, 300) : "unknown");
    }
  },
);
