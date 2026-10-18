// Job: create an invoice snapshot from a delivery.
import { NextResponse } from "next/server";
import { duplicateNumberError } from "@/lib/api/duplicate-number";
import { HttpError, withRoute } from "@/lib/api/with-route";
import { parseDelivery } from "@/lib/invoice-input";
import { getCustomer } from "@/lib/queries/customers";
import { listProducts } from "@/lib/queries/products";
import { createInvoice } from "@/lib/queries/invoices";

export const POST = withRoute("POST /api/invoices", async (req, _ctx, logCtx) => {
  const body = await req.json().catch(() => ({}));
  const customer = typeof body.customerId === "string" ? await getCustomer(body.customerId) : undefined;
  if (!customer) throw new HttpError(400, "Pick a cafe.");
  logCtx.cafe = customer.name;

  const parsed = parseDelivery(body, await listProducts());
  if (!parsed.ok) throw new HttpError(400, parsed.message);
  logCtx.invoiceNumber = parsed.value.number;

  try {
    const id = await createInvoice({ customer, ...parsed.value });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    throw duplicateNumberError(err);
  }
});
