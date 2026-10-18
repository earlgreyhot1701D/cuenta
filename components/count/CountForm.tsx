// Job: the Count screen's cafe picker, steppers and Save for one cafe.
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Stepper } from "./Stepper";
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
  const [pendingCafe, setPendingCafe] = useState<string | null>(null);

  const entries = rows
    .filter((r) => (values[r.productId] ?? "") !== "")
    .map((r) => ({ productId: r.productId, quantity: Number(values[r.productId]) }));
  const dirty = entries.length > 0;
  const cafeName = cafes.find((c) => c.id === cafeId)?.name ?? "";

  function switchCafe(id: string) {
    if (dirty) setPendingCafe(id);
    else router.push(`/count?cafe=${id}`);
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
        <CafePicker cafes={cafes} selectedId={cafeId} onSelect={switchCafe} />
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

      {pendingCafe && (
        <Confirm
          message={`Discard the unsaved counts for ${cafeName}?`}
          confirmLabel="Discard"
          onCancel={() => setPendingCafe(null)}
          onConfirm={() => {
            const id = pendingCafe;
            setPendingCafe(null);
            setValues({});
            router.push(`/count?cafe=${id}`);
          }}
        />
      )}
    </>
  );
}
