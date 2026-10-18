// Job: build an invoice's header and lines for one cafe, with live totals, then create it.
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LineRow } from "./LineRow";
import { CafePicker } from "@/components/ui/CafePicker";
import { Confirm } from "@/components/ui/Confirm";
import { api } from "@/lib/api/client";
import { suggestNumber } from "@/lib/invoice-number";
import { formatUSD, lineTotal, parseUSD, sumCents } from "@/lib/money";
import styles from "./DeliveryForm.module.css";

export type DeliveryLine = {
  productId: string;
  name: string;
  priceCents: number;
  shelf: { quantity: number; countedOn: string } | null;
};

export type DeliveryCafe = { id: string; code: number; name: string; lines: DeliveryLine[] };

type LineState = { price: string; quantity: string };

function freshLines(cafe: DeliveryCafe | undefined): Record<string, LineState> {
  // Quantities always start blank; the shelf count is reference only and never pre-fills them.
  return Object.fromEntries(
    (cafe?.lines ?? []).map((l) => [l.productId, { price: (l.priceCents / 100).toFixed(2), quantity: "" }]),
  );
}

export function DeliveryForm({ cafes, defaultDate }: { cafes: DeliveryCafe[]; defaultDate: string }) {
  const router = useRouter();
  const [cafeId, setCafeId] = useState<string | undefined>();
  const [date, setDate] = useState(defaultDate);
  const [typedNumber, setTypedNumber] = useState("");
  const [numberTouched, setNumberTouched] = useState(false);
  const [lines, setLines] = useState<Record<string, LineState>>({});
  const [numberMessage, setNumberMessage] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingCafe, setPendingCafe] = useState<string | null>(null);

  const cafe = cafes.find((c) => c.id === cafeId);
  const suggestion = cafe && date ? suggestNumber(cafe.code, date) : "";
  const number = numberTouched ? typedNumber : suggestion;

  const rows = (cafe?.lines ?? []).map((line) => {
    const state = lines[line.productId] ?? { price: "", quantity: "" };
    const priceCents = parseUSD(state.price);
    const quantity = state.quantity === "" ? 0 : Number(state.quantity);
    const total = priceCents !== null && quantity > 0 ? lineTotal(priceCents, quantity) : null;
    return { line, state, priceCents, quantity, total };
  });
  const delivered = rows.filter((r) => r.quantity > 0);
  const invoiceTotal = sumCents(delivered.map((r) => r.total ?? 0));
  const anyPriceInvalid = delivered.some((r) => r.priceCents === null);
  const canCreate = !!cafe && !!date && number.trim() !== "" && delivered.length > 0 && !anyPriceInvalid && !busy;

  function chooseCafe(id: string) {
    setCafeId(id);
    setLines(freshLines(cafes.find((c) => c.id === id)));
    setNumberMessage("");
    setMessage("");
  }

  function setLine(productId: string, patch: Partial<LineState>) {
    setLines((prev) => ({ ...prev, [productId]: { ...prev[productId], ...patch } }));
  }

  async function create() {
    if (!cafe) return;
    setBusy(true);
    setMessage("");
    setNumberMessage("");
    const result = await api<{ id: string }>("/api/invoices", {
      method: "POST",
      body: {
        customerId: cafe.id,
        invoiceDate: date,
        number: number.trim(),
        lines: delivered.map((r) => ({
          productId: r.line.productId,
          unitPriceCents: r.priceCents,
          quantity: r.quantity,
        })),
      },
    });
    if (result.ok) {
      router.push(`/invoices/${result.data.id}`);
      return;
    }
    setBusy(false);
    if (result.status === 409) setNumberMessage(result.message);
    else setMessage(result.message);
  }

  return (
    <div className={styles.form}>
      <section className={styles.section}>
        <p className="label muted">Cafe</p>
        <CafePicker
          cafes={cafes}
          selectedId={cafeId}
          onSelect={(id) => (delivered.length > 0 ? setPendingCafe(id) : chooseCafe(id))}
        />
      </section>

      <section className={styles.header}>
        <label className={styles.headerField}>
          <span className="label muted">Date</span>
          <input className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className={styles.headerField}>
          <span className="label muted">Invoice #</span>
          <input
            className="field"
            value={number}
            placeholder={cafe ? "" : "Pick a cafe"}
            onChange={(e) => {
              setNumberTouched(true);
              setTypedNumber(e.target.value);
              setNumberMessage("");
            }}
          />
          <span className="quiet" role="status">
            {numberMessage}
          </span>
        </label>
      </section>

      {!cafe ? (
        <p className="quiet">Pick a cafe to see its standing list.</p>
      ) : (
        <>
          <div className={`label ${styles.columns}`}>
            <span>Description</span>
            <span>Price</span>
            <span>Qty</span>
            <span>Total</span>
          </div>
          <ul className={styles.lines}>
            {rows.map(({ line, state, priceCents, total, quantity }) => (
              <LineRow
                key={line.productId}
                name={line.name}
                shelf={line.shelf}
                price={state.price}
                quantity={state.quantity}
                totalCents={total}
                priceInvalid={priceCents === null && (quantity > 0 || state.price !== "")}
                onPrice={(price) => setLine(line.productId, { price })}
                onQuantity={(q) => setLine(line.productId, { quantity: q })}
              />
            ))}
          </ul>
          <div className={styles.totalRow}>
            <span className="label">Invoice total</span>
            <span className={styles.total}>{formatUSD(invoiceTotal)}</span>
          </div>
        </>
      )}

      <div className={styles.actions}>
        <p className="quiet" role="status">
          {message || (anyPriceInvalid ? "Check the prices on the lines you're delivering." : "")}
        </p>
        <button className="btn btn-primary" type="button" disabled={!canCreate} onClick={create}>
          Create invoice
        </button>
      </div>

      {pendingCafe && (
        <Confirm
          message={`Discard the quantities entered for ${cafe?.name}?`}
          confirmLabel="Discard"
          onCancel={() => setPendingCafe(null)}
          onConfirm={() => {
            chooseCafe(pendingCafe);
            setPendingCafe(null);
          }}
        />
      )}
    </div>
  );
}
