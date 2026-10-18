// Job: return the invoice PDF for download.
import { HttpError, withRoute } from "@/lib/api/with-route";
import { fitsOnePage } from "@/lib/invoice-capacity";
import { printBaseUrl, renderInvoicePdf } from "@/lib/pdf/render-invoice-pdf";
import { getInvoice } from "@/lib/queries/invoices";

export const maxDuration = 60;

export const GET = withRoute<{ params: Promise<{ id: string }> }>(
  "GET /api/invoices/[id]/pdf",
  async (req, { params }, logCtx) => {
    const found = await getInvoice((await params).id);
    if (!found) throw new HttpError(404, "That invoice wasn't found.");
    logCtx.invoiceNumber = found.invoice.number;
    logCtx.cafe = found.invoice.cafeName;
    if (!fitsOnePage(found.lines.length)) throw new HttpError(422, "Too many lines for one page");

    const pdf = await renderInvoicePdf(found.invoice.id, printBaseUrl(req.url));
    const filename = `Invoice-${found.invoice.number.replace(/[^A-Za-z0-9_-]/g, "_")}.pdf`;
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  },
);
