// Job: mark an invoice paid (with date and optional reference) or unpaid.
import { NextResponse } from "next/server";
import { HttpError, withRoute } from "@/lib/api/with-route";
import { isValidYmd } from "@/lib/dates";
import { getInvoice } from "@/lib/queries/invoices";
import { clearPayment, setPayment } from "@/lib/queries/ledger";

type Ctx = { params: Promise<{ id: string }> };

async function payable(ctx: Ctx, logCtx: { invoiceNumber?: string; cafe?: string }) {
  const found = await getInvoice((await ctx.params).id);
  if (!found) throw new HttpError(404, "That invoice wasn't found.");
  logCtx.invoiceNumber = found.invoice.number;
  logCtx.cafe = found.invoice.cafeName;
  if (found.invoice.voidedAt) throw new HttpError(409, "A void invoice can't be marked paid.");
  return found.invoice;
}

export const POST = withRoute<Ctx>("POST /api/invoices/[id]/payment", async (req, ctx, logCtx) => {
  const invoice = await payable(ctx, logCtx);
  const body = await req.json().catch(() => ({}));
  if (!isValidYmd(body.paidOn)) throw new HttpError(400, "Check the paid date.");
  const reference = typeof body.reference === "string" ? body.reference.trim().slice(0, 80) : "";
  await setPayment(invoice.id, body.paidOn, reference || null);
  return NextResponse.json({ ok: true });
});

export const DELETE = withRoute<Ctx>("DELETE /api/invoices/[id]/payment", async (_req, ctx, logCtx) => {
  const invoice = await payable(ctx, logCtx);
  await clearPayment(invoice.id);
  return NextResponse.json({ ok: true });
});
