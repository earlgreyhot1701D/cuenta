// Job: check delivery validation keeps only delivered lines, snapshots names, and checks special orders.
import { describe, expect, it } from "vitest";
import { parseDelivery } from "@/lib/invoice-input";

const standing = [
  { productId: "p1", slug: "a", name: "Strawberry Tres Leches Cake", priceCents: 475 },
  { productId: "p2", slug: "b", name: "Pixie Tangerine/Orange Flan", priceCents: 400 },
];

const base = { invoiceDate: "2026-10-17", number: " 110172026 " };

describe("parseDelivery", () => {
  it("keeps only lines with a quantity of 1 or more, with their own price", () => {
    const r = parseDelivery(
      { ...base, lines: [{ productId: "p1", unitPriceCents: 500, quantity: 3 }, { productId: "p2", unitPriceCents: 400, quantity: 0 }] },
      standing,
    );
    expect(r).toEqual({
      ok: true,
      value: {
        invoiceDate: "2026-10-17",
        number: "110172026",
        lines: [{ productId: "p1", description: "Strawberry Tres Leches Cake", unitPriceCents: 500, quantity: 3 }],
      },
    });
  });
  it("refuses an invoice with nothing delivered", () => {
    expect(parseDelivery({ ...base, lines: [{ productId: "p1", unitPriceCents: 475, quantity: 0 }] }, standing).ok).toBe(false);
  });
  it("refuses products off the cafe's list, negative prices, bad dates and empty numbers", () => {
    const line = { productId: "p1", unitPriceCents: 475, quantity: 1 };
    expect(parseDelivery({ ...base, lines: [{ ...line, productId: "zz" }] }, standing).ok).toBe(false);
    expect(parseDelivery({ ...base, lines: [{ ...line, unitPriceCents: -1 }] }, standing).ok).toBe(false);
    expect(parseDelivery({ ...base, invoiceDate: "2026-02-30", lines: [line] }, standing).ok).toBe(false);
    expect(parseDelivery({ ...base, number: "  ", lines: [line] }, standing).ok).toBe(false);
  });
  it("keeps a complete special order after the standing lines, with no product", () => {
    const r = parseDelivery(
      {
        ...base,
        lines: [
          { productId: "p1", unitPriceCents: 475, quantity: 2 },
          { productId: null, description: "  Birthday tres leches  ", unitPriceCents: 3500, quantity: 1 },
        ],
      },
      standing,
    );
    expect(r.ok && r.value.lines).toEqual([
      { productId: "p1", description: "Strawberry Tres Leches Cake", unitPriceCents: 475, quantity: 2 },
      { productId: null, description: "Birthday tres leches", unitPriceCents: 3500, quantity: 1 },
    ]);
  });
  it("allows a free special order (price 0) on its own", () => {
    expect(parseDelivery({ ...base, lines: [{ description: "Sample flan", unitPriceCents: 0, quantity: 1 }] }, standing).ok).toBe(true);
  });
  it("refuses a special order with no description, a negative price or a quantity of 0", () => {
    const special = { productId: null, description: "Birthday cake", unitPriceCents: 3500, quantity: 1 };
    for (const bad of [{ description: "  " }, { unitPriceCents: -100 }, { quantity: 0 }]) {
      const r = parseDelivery({ ...base, lines: [{ productId: "p1", unitPriceCents: 475, quantity: 1 }, { ...special, ...bad }] }, standing);
      expect(r.ok).toBe(false);
    }
  });
});
