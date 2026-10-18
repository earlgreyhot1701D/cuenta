// Job: return the filled email (recipient from the snapshot, subject, body, attachment name) for the confirm sheet.
import { NextResponse } from "next/server";
import { HttpError, withRoute } from "@/lib/api/with-route";
import { buildInvoiceEmail } from "@/lib/email/invoice-email";
import { lineTotal, sumCents } from "@/lib/money";
import { getInvoice } from "@/lib/queries/invoices";

export const GET = withRoute<{ params: Promise<{ id: string }> }>(
  "GET /api/invoices/[id]/email-preview",
  async (_req, { params }, logCtx) => {
    const found = await getInvoice((await params).id);
    if (!found) throw new HttpError(404, "That invoice wasn't found.");
    const { invoice, lines } = found;
    logCtx.invoiceNumber = invoice.number;
    const email = buildInvoiceEmail({
      number: invoice.number,
      cafeName: invoice.cafeName,
      invoiceDate: invoice.invoiceDate,
      totalCents: sumCents(lines.map((l) => lineTotal(l.unitPriceCents, l.quantity))),
    });
    return NextResponse.json({ to: invoice.cafeEmail ?? "", cafeName: invoice.cafeName, ...email });
  },
);
