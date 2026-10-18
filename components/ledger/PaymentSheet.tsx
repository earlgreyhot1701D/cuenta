// Job: the Mark paid / Mark unpaid sheet for one ledger row.
"use client";

import { useState } from "react";
import { Sheet, useSheetClose } from "@/components/ui/Sheet";
import { api } from "@/lib/api/client";
import { formatShort } from "@/lib/dates";
import { formatUSD } from "@/lib/money";
import type { LedgerRowData } from "./LedgerRow";
import sheet from "@/components/ui/Sheet.module.css";
import styles from "./PaymentSheet.module.css";

type Props = { row: LedgerRowData; today: string; onClose: () => void; onSaved: () => void };

export function PaymentSheet(props: Props) {
  return (
    <Sheet label={`Payment for ${props.row.number}`} onClose={props.onClose}>
      <PaymentBody {...props} />
    </Sheet>
  );
}

function PaymentBody({ row, today, onClose, onSaved }: Props) {
  const close = useSheetClose();
  const [paidOn, setPaidOn] = useState(today);
  const [reference, setReference] = useState("");
  const [confirmUnpaid, setConfirmUnpaid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(method: "POST" | "DELETE") {
    setBusy(true);
    setMessage("");
    const result = await api(`/api/invoices/${row.id}/payment`, {
      method,
      body: method === "POST" ? { paidOn, reference } : undefined,
    });
    setBusy(false);
    if (result.ok) close(onSaved);
    else setMessage(result.message);
  }

  return (
    <>
      <h2 className={styles.title}>
        {row.number} · {formatUSD(row.totalCents)}
      </h2>
      <p className="quiet">{row.cafeName}</p>

      {row.status === "unpaid" ? (
        <>
          <label className={styles.field}>
            <span className="label muted">Paid on</span>
            <input className="field" type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className="label muted">Reference (optional)</span>
            <input
              className="field"
              maxLength={80}
              placeholder="ACH confirmation"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </label>
          <p className="quiet" role="status">{message}</p>
          <div className={sheet.actions}>
            <button className="btn" type="button" onClick={() => close(onClose)} disabled={busy}>
              Cancel
            </button>
            <button className="btn btn-primary" type="button" onClick={() => submit("POST")} disabled={busy || !paidOn}>
              Mark paid
            </button>
          </div>
        </>
      ) : (
        <>
          <p className={styles.paid}>
            Paid {row.paidOn ? formatShort(row.paidOn) : ""}
            {row.paidReference ? ` · ${row.paidReference}` : ""}
          </p>
          {confirmUnpaid && <p className={styles.confirm}>Mark {row.number} unpaid again?</p>}
          <p className="quiet" role="status">{message}</p>
          <div className={sheet.actions}>
            <button className="btn" type="button" onClick={() => close(onClose)} disabled={busy}>
              Cancel
            </button>
            {confirmUnpaid ? (
              <button className="btn btn-primary" type="button" onClick={() => submit("DELETE")} disabled={busy}>
                Yes, mark unpaid
              </button>
            ) : (
              <button className="btn" type="button" onClick={() => setConfirmUnpaid(true)}>
                Mark unpaid
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
