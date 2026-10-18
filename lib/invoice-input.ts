// Job: validate a submitted delivery (date, number, menu and special order lines) before it becomes an invoice.
import { isValidYmd } from "@/lib/dates";
import type { NewLine } from "@/lib/queries/invoices";

export type DeliveryInput = {
  invoiceDate: string;
  number: string;
  lines: NewLine[];
};

/** A product the delivery may bill, with the description its line saves. */
export type BillableProduct = { productId: string; name: string };

type RawLine = { productId?: unknown; description?: unknown; unitPriceCents?: unknown; quantity?: unknown };

const MAX_DESCRIPTION = 80;
const validPrice = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;
const validQty = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 9999;

/**
 * Returns the clean input, or a one-line message saying what's wrong.
 * Menu lines with quantity 0 are dropped; a special order line (no productId) must be complete.
 */
export function parseDelivery(
  body: { invoiceDate?: unknown; number?: unknown; lines?: unknown },
  billable: BillableProduct[],
): { ok: true; value: DeliveryInput } | { ok: false; message: string } {
  if (!isValidYmd(body.invoiceDate)) return { ok: false, message: "Check the date." };

  const number = typeof body.number === "string" ? body.number.trim() : "";
  if (!number || number.length > 40) return { ok: false, message: "Enter an invoice number." };

  const byId = new Map(billable.map((p) => [p.productId, p]));
  const raw: RawLine[] = Array.isArray(body.lines) ? body.lines : [];
  const lines: NewLine[] = [];
  for (const line of raw) {
    const { unitPriceCents: price, quantity: qty } = line;

    if (line.productId === null || line.productId === undefined) {
      const description = typeof line.description === "string" ? line.description.trim() : "";
      if (!description || description.length > MAX_DESCRIPTION) {
        return { ok: false, message: "Each special order needs a description." };
      }
      if (!validPrice(price)) return { ok: false, message: `Check the price for ${description}.` };
      if (!validQty(qty) || qty < 1) return { ok: false, message: `Check the quantity for ${description}.` };
      lines.push({ productId: null, description, unitPriceCents: price, quantity: qty });
      continue;
    }

    const product = typeof line.productId === "string" ? byId.get(line.productId) : undefined;
    if (!product) return { ok: false, message: "A line isn't on the menu." };
    if (!validPrice(price)) return { ok: false, message: `Check the price for ${product.name}.` };
    if (!validQty(qty)) return { ok: false, message: `Check the quantity for ${product.name}.` };
    if (qty >= 1) {
      lines.push({ productId: product.productId, description: product.name, unitPriceCents: price, quantity: qty });
    }
  }
  if (lines.length === 0) return { ok: false, message: "Enter at least one quantity." };

  return { ok: true, value: { invoiceDate: body.invoiceDate, number, lines } };
}
