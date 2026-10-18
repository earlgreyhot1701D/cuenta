// Job: validate a submitted delivery (cafe, date, number, lines) before it becomes an invoice.
import type { StandingProduct } from "@/lib/queries/products";
import type { NewLine } from "@/lib/queries/invoices";

export type DeliveryInput = {
  invoiceDate: string;
  number: string;
  lines: NewLine[];
};

type RawLine = { productId?: unknown; unitPriceCents?: unknown; quantity?: unknown };

function isValidDate(ymd: unknown): ymd is string {
  if (typeof ymd !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const d = new Date(`${ymd}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === ymd;
}

/** Returns the clean input, or a one-line message saying what's wrong. */
export function parseDelivery(
  body: { invoiceDate?: unknown; number?: unknown; lines?: unknown },
  standing: StandingProduct[],
): { ok: true; value: DeliveryInput } | { ok: false; message: string } {
  if (!isValidDate(body.invoiceDate)) return { ok: false, message: "Check the date." };

  const number = typeof body.number === "string" ? body.number.trim() : "";
  if (!number || number.length > 40) return { ok: false, message: "Enter an invoice number." };

  const byId = new Map(standing.map((p) => [p.productId, p]));
  const raw: RawLine[] = Array.isArray(body.lines) ? body.lines : [];
  const lines: NewLine[] = [];
  for (const line of raw) {
    const product = typeof line.productId === "string" ? byId.get(line.productId) : undefined;
    const price = line.unitPriceCents;
    const qty = line.quantity;
    if (!product) return { ok: false, message: "A line isn't on this cafe's list." };
    if (!Number.isInteger(price) || (price as number) < 0) return { ok: false, message: `Check the price for ${product.name}.` };
    if (!Number.isInteger(qty) || (qty as number) < 0 || (qty as number) > 9999) {
      return { ok: false, message: `Check the quantity for ${product.name}.` };
    }
    if ((qty as number) >= 1) {
      lines.push({
        productId: product.productId,
        description: product.name,
        unitPriceCents: price as number,
        quantity: qty as number,
      });
    }
  }
  if (lines.length === 0) return { ok: false, message: "Enter at least one quantity." };

  return { ok: true, value: { invoiceDate: body.invoiceDate, number, lines } };
}
