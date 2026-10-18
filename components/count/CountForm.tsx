// Job: the Count screen's cafe picker, steppers and Save for one cafe.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Stepper } from "./Stepper";
import { setUnsaved } from "@/components/nav/unsaved";
import { CafePicker, type CafeOption } from "@/components/ui/CafePicker";
import { Confirm } from "@/components/ui/Confirm";
import { api } from "@/lib/api/client";
import { formatShort } from "@/lib/dates";
import styles from "./CountForm.module.css";

export type CountRow = {
  productId: string;
  name: string;
  last: { quantity: number; countedOn: string } | null;
};

export function CountForm({
  cafes,
  cafeId,
  rows,
}: {
  cafes: CafeOption[];
  cafeId: string;
  rows: CountRow[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  // Where she asked to go while entries were unsaved: another cafe, or Past counts.
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const entries = rows
    .filter((r) => (values[r.productId] ?? "") !== "")
    .map((r) => ({ productId: r.productId, quantity: Number(values[r.productId]) }));
  const dirty = entries.length > 0;
  const cafeName = cafes.find((c) => c.id === cafeId)?.name ?? "";
  const discardQuestion = `Discard the unsaved counts for ${cafeName}?`;

  // The bottom nav reads this before leaving the screen.
  useEffect(() => {
    setUnsaved(dirty ? discardQuestion : null);
    return () => setUnsaved(null);
  }, [dirty, discardQuestion]);

  function leaveTo(href: string) {
    if (dirty) setPendingHref(href);
    else router.push(href);
  }

  async function save() {
    setBusy(true);
    setMessage("");
    const result = await api("/api/counts", { method: "POST", body: { customerId: cafeId, entries } });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setValues({});
    setMessage("Saved");
    router.refresh();
    setTimeout(() => setMessage((m) => (m === "Saved" ? "" : m)), 2000);
  }

  return (
    <>
      <section className={styles.picker}>
        <p className="label muted">Cafe</p>
        <CafePicker cafes={cafes} selectedId={cafeId} onSelect={(id) => leaveTo(`/count?cafe=${id}`)} />
        <Link
          href={`/count/past?cafe=${cafeId}`}
          className={`label ${styles.pastLink}`}
          onClick={(e) => {
            e.preventDefault();
            leaveTo(`/count/past?cafe=${cafeId}`);
          }}
        >
          Past counts
        </Link>
      </section>

      <div className={`label ${styles.columns}`}>
        <span>Item</span>
        <span>On the shelf</span>
      </div>

      <ul className={styles.rows}>
        {rows.map((row) => (
          <li key={row.productId} className={styles.row}>
            <div className={styles.text}>
              <span className={styles.name}>{row.name}</span>
              <span className={`label ${styles.last}`}>
                {row.last
                  ? `last counted ${formatShort(row.last.countedOn)}: ${row.last.quantity}`
                  : "not counted yet"}
              </span>
            </div>
            <Stepper
              label={row.name}
              value={values[row.productId] ?? ""}
              onChange={(v) => setValues((prev) => ({ ...prev, [row.productId]: v }))}
            />
          </li>
        ))}
      </ul>

      <div className={styles.saveBar}>
        <p className="quiet" role="status">
          {message}
        </p>
        <button className="btn btn-primary" type="button" disabled={!dirty || busy} onClick={save}>
          Save count
        </button>
      </div>

      {pendingHref && (
        <Confirm
          message={discardQuestion}
          confirmLabel="Discard"
          onCancel={() => setPendingHref(null)}
          onConfirm={() => {
            const href = pendingHref;
            setPendingHref(null);
            setValues({});
            setUnsaved(null);
            router.push(href);
          }}
        />
      )}
    </>
  );
}
