// Job: save an edited invoice (date, number, lines); the cafe stays the one it was created for.
import { NextResponse } from "next/server";
import { duplicateNumberError } from "@/lib/api/duplicate-number";
import { HttpError, withRoute } from "@/lib/api/with-route";
import { parseDelivery, type BillableProduct } from "@/lib/invoice-input";
import { getInvoice, updateInvoice } from "@/lib/queries/invoices";
import { standingProducts } from "@/lib/queries/products";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withRoute<Ctx>("PUT /api/invoices/[id]", async (req, ctx, logCtx) => {
  const found = await getInvoice((await ctx.params).id);
  if (!found) throw new HttpError(404, "That invoice wasn't found.");
  const { invoice, lines } = found;
  logCtx.invoiceNumber = invoice.number;
  logCtx.cafe = invoice.cafeName;
  if (invoice.voidedAt) throw new HttpError(409, "A void invoice can't be edited.");

  const body = await req.json().catch(() => ({}));
  if (body.customerId !== undefined && body.customerId !== invoice.customerId) {
    throw new HttpError(400, "To bill a different cafe, void this invoice and create a new one.");
  }

  // Lines already on the invoice keep their saved description; the rest of the standing list can be added.
  const billable: BillableProduct[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    if (line.productId && !seen.has(line.productId)) {
      billable.push({ productId: line.productId, name: line.description });
      seen.add(line.productId);
    }
  }
  for (const p of await standingProducts(invoice.customerId)) {
    if (!seen.has(p.productId)) billable.push(p);
  }

  const parsed = parseDelivery(body, billable);
  if (!parsed.ok) throw new HttpError(400, parsed.message);
  logCtx.invoiceNumber = parsed.value.number;

  try {
    await updateInvoice(invoice.id, parsed.value);
    return NextResponse.json({ id: invoice.id });
  } catch (err) {
    throw duplicateNumberError(err);
  }
});
