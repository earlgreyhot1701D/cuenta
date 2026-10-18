// Job: the delivery header (cafe, date, number), new-or-edit mode, and saving it as an invoice.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LineRow } from "./LineRow";
import { SpecialOrderRow } from "./SpecialOrderRow";
import { useDeliveryLines, type DeliveryCafe, type SavedLines } from "./useDeliveryLines";
import { setUnsaved } from "@/components/nav/unsaved";
import { CafePicker } from "@/components/ui/CafePicker";
import { Confirm } from "@/components/ui/Confirm";
import { api } from "@/lib/api/client";
import { suggestNumber } from "@/lib/invoice-number";
import { formatUSD } from "@/lib/money";
import styles from "./DeliveryForm.module.css";

export type { DeliveryCafe, DeliveryLine } from "./useDeliveryLines";

export type DeliveryMode =
  | { kind: "new"; defaultDate: string }
  | { kind: "edit"; invoiceId: string; number: string; invoiceDate: string; saved: SavedLines };

export function DeliveryForm({ cafes, mode }: { cafes: DeliveryCafe[]; mode: DeliveryMode }) {
  const editing = mode.kind === "edit";
  const router = useRouter();
  // Edit locks the cafe: to bill a different cafe, she voids this invoice and creates a new one.
  const [cafeId, setCafeId] = useState<string | undefined>(editing ? cafes[0]?.id : undefined);
  const [date, setDate] = useState(editing ? mode.invoiceDate : mode.defaultDate);
  const [typedNumber, setTypedNumber] = useState(editing ? mode.number : "");
  const [numberTouched, setNumberTouched] = useState(editing);
  const [numberMessage, setNumberMessage] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingCafe, setPendingCafe] = useState<string | null>(null);

  const cafe = cafes.find((c) => c.id === cafeId);
  const lines = useDeliveryLines(cafe, editing ? mode.saved : undefined);
  const suggestion = cafe && date ? suggestNumber(cafe.code, date) : "";
  const number = numberTouched ? typedNumber : suggestion;
  const canSave = !!cafe && !!date && number.trim() !== "" && lines.hasLines && !lines.problem && !busy;

  // A new delivery with lines entered asks before the bottom nav leaves it.
  const unsaved = !editing && lines.hasLines && !busy;
  useEffect(() => {
    setUnsaved(unsaved ? "Discard this delivery? The quantities you entered will be lost." : null);
    return () => setUnsaved(null);
  }, [unsaved]);

  function chooseCafe(id: string) {
    setCafeId(id);
    lines.reset(cafes.find((c) => c.id === id));
    setNumberMessage("");
    setMessage("");
  }

  async function save() {
    if (!cafe) return;
    setBusy(true);
    setMessage("");
    setNumberMessage("");
    const body = { customerId: cafe.id, invoiceDate: date, number: number.trim(), lines: lines.payload() };
    const result = editing
      ? await api<{ id: string }>(`/api/invoices/${mode.invoiceId}`, { method: "PUT", body })
      : await api<{ id: string }>("/api/invoices", { method: "POST", body });
    if (result.ok) {
      router.push(`/invoices/${result.data.id}`);
      router.refresh();
      return;
    }
    setBusy(false);
    if (result.status === 409 && result.data?.usedOn) setNumberMessage(result.message);
    else setMessage(result.message);
  }

  return (
    <div className={styles.form}>
      <section className={styles.section}>
        <p className="label muted">Cafe</p>
        {editing ? (
          <>
            <p className={styles.lockedCafe}>{cafe?.name}</p>
            <p className="quiet">To bill a different cafe, void this invoice and create a new one.</p>
          </>
        ) : (
          <CafePicker
            cafes={cafes}
            selectedId={cafeId}
            onSelect={(id) => (lines.hasLines ? setPendingCafe(id) : chooseCafe(id))}
          />
        )}
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
        <p className="quiet">Pick a cafe to see the menu.</p>
      ) : (
        <>
          <div className={`label ${styles.columns}`}>
            <span>Description</span>
            <span>Price</span>
            <span>Qty</span>
            <span>Total</span>
          </div>
          <ul className={styles.lines}>
            {lines.rows.map(({ line, state, priceCents, total, quantity }) => (
              <LineRow
                key={line.productId}
                name={line.name}
                shelf={line.shelf}
                price={state.price}
                quantity={state.quantity}
                totalCents={total}
                priceInvalid={priceCents === null && (quantity > 0 || state.price !== "")}
                onPrice={(price) => lines.setLine(line.productId, { price })}
                onQuantity={(q) => lines.setLine(line.productId, { quantity: q })}
              />
            ))}
            {lines.specialRows.map(({ state, priceCents, quantity, total, descriptionMissing }) => (
              <SpecialOrderRow
                key={state.key}
                description={state.description}
                price={state.price}
                quantity={state.quantity}
                totalCents={total}
                descriptionInvalid={descriptionMissing && state.price !== ""}
                priceInvalid={priceCents === null && (state.price !== "" || !descriptionMissing)}
                quantityInvalid={quantity < 1 && !descriptionMissing}
                onDescription={(description) => lines.setSpecial(state.key, { description })}
                onPrice={(price) => lines.setSpecial(state.key, { price })}
                onQuantity={(q) => lines.setSpecial(state.key, { quantity: q })}
                onRemove={() => lines.removeSpecial(state.key)}
              />
            ))}
          </ul>
          <button type="button" className={`label ${styles.addSpecial}`} onClick={lines.addSpecial}>
            + Add special order
          </button>
          <div className={styles.totalRow}>
            <span className="label">Invoice total</span>
            <span className={styles.total}>{formatUSD(lines.total)}</span>
          </div>
        </>
      )}

      <div className={styles.actions}>
        <p className="quiet" role="status">
          {message || lines.problem}
        </p>
        <button className="btn btn-primary" type="button" disabled={!canSave} onClick={save}>
          {editing ? (busy ? "Saving…" : "Save changes") : "Create invoice"}
        </button>
        {editing && (
          <Link className="label" href={`/invoices/${mode.invoiceId}`}>
            Cancel
          </Link>
        )}
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
