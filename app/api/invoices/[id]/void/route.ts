// Job: void an invoice: stamp it, keep it visible, and keep its number taken.
import { NextResponse } from "next/server";
import { HttpError, withRoute } from "@/lib/api/with-route";
import { getInvoice, voidInvoice } from "@/lib/queries/invoices";

export const POST = withRoute<{ params: Promise<{ id: string }> }>(
  "POST /api/invoices/[id]/void",
  async (_req, { params }, logCtx) => {
    const found = await getInvoice((await params).id);
    if (!found) throw new HttpError(404, "That invoice wasn't found.");
    logCtx.invoiceNumber = found.invoice.number;
    logCtx.cafe = found.invoice.cafeName;
    // A second tap is harmless: the first void time is kept.
    await voidInvoice(found.invoice.id);
    return NextResponse.json({ ok: true });
  },
);
