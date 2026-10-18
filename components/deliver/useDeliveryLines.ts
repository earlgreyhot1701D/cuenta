// Job: hold a delivery's line state (menu quantities, per-line prices, special orders) and its totals.
"use client";

import { useState } from "react";
import { lineTotal, parseUSD, sumCents } from "@/lib/money";

export type DeliveryLine = {
  productId: string;
  name: string;
  priceCents: number;
  shelf: { quantity: number; countedOn: string } | null;
};

export type DeliveryCafe = { id: string; code: number; name: string; lines: DeliveryLine[] };

/** What Edit starts from: the saved quantities per product and the saved special orders. */
export type SavedLines = {
  quantities: Record<string, number>;
  specials: { description: string; unitPriceCents: number; quantity: number }[];
};

type LineState = { price: string; quantity: string };
type SpecialState = LineState & { key: number; description: string };

const dollars = (cents: number) => (cents / 100).toFixed(2);

function freshLines(cafe: DeliveryCafe | undefined, saved?: SavedLines): Record<string, LineState> {
  // On a new delivery quantities start blank; the shelf count is reference only and never pre-fills them.
  return Object.fromEntries(
    (cafe?.lines ?? []).map((l) => {
      const q = saved?.quantities[l.productId];
      return [l.productId, { price: dollars(l.priceCents), quantity: q ? String(q) : "" }];
    }),
  );
}

let nextKey = 1;

function savedSpecials(saved?: SavedLines): SpecialState[] {
  return (saved?.specials ?? []).map((s) => ({
    key: nextKey++,
    description: s.description,
    price: dollars(s.unitPriceCents),
    quantity: String(s.quantity),
  }));
}

function measure(state: LineState) {
  const priceCents = parseUSD(state.price);
  const quantity = state.quantity === "" ? 0 : Number(state.quantity);
  const total = priceCents !== null && quantity > 0 ? lineTotal(priceCents, quantity) : null;
  return { priceCents, quantity, total };
}

export function useDeliveryLines(cafe: DeliveryCafe | undefined, saved?: SavedLines) {
  const [lines, setLines] = useState<Record<string, LineState>>(() => freshLines(cafe, saved));
  const [specials, setSpecials] = useState<SpecialState[]>(() => savedSpecials(saved));

  const rows = (cafe?.lines ?? []).map((line) => {
    const state = lines[line.productId] ?? { price: "", quantity: "" };
    return { line, state, ...measure(state) };
  });
  const specialRows = specials.map((state) => {
    const m = measure(state);
    const descriptionMissing = state.description.trim() === "";
    return { state, ...m, valid: !descriptionMissing && m.priceCents !== null && m.quantity >= 1, descriptionMissing };
  });

  const delivered = rows.filter((r) => r.quantity > 0);
  const total = sumCents([...delivered, ...specialRows].map((r) => r.total ?? 0));
  const problem = delivered.some((r) => r.priceCents === null)
    ? "Check the prices on the lines you're delivering."
    : specialRows.some((r) => !r.valid)
      ? "Each special order needs a description, a price and a quantity of at least 1."
      : "";
  const hasLines = delivered.length + specialRows.length > 0;

  return {
    rows,
    specialRows,
    total,
    problem,
    hasLines,
    /** Lines as the API takes them: menu lines first, then special orders in the order added. */
    payload: () => [
      ...delivered.map((r) => ({ productId: r.line.productId, unitPriceCents: r.priceCents, quantity: r.quantity })),
      ...specialRows.map((r) => ({
        productId: null,
        description: r.state.description.trim(),
        unitPriceCents: r.priceCents,
        quantity: r.quantity,
      })),
    ],
    reset: (next: DeliveryCafe | undefined) => {
      setLines(freshLines(next));
      setSpecials([]);
    },
    setLine: (productId: string, patch: Partial<LineState>) =>
      setLines((prev) => ({ ...prev, [productId]: { ...prev[productId], ...patch } })),
    addSpecial: () => setSpecials((prev) => [...prev, { key: nextKey++, description: "", price: "", quantity: "1" }]),
    setSpecial: (key: number, patch: Partial<Omit<SpecialState, "key">>) =>
      setSpecials((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s))),
    removeSpecial: (key: number) => setSpecials((prev) => prev.filter((s) => s.key !== key)),
  };
}
