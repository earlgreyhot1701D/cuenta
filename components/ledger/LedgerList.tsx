// Job: the ledger's rows and the payment sheet they open.
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LedgerRow, type LedgerRowData } from "./LedgerRow";
import { PaymentSheet } from "./PaymentSheet";
import styles from "./LedgerList.module.css";

export function LedgerList({ rows, today }: { rows: LedgerRowData[]; today: string }) {
  const router = useRouter();
  const [open, setOpen] = useState<LedgerRowData | null>(null);

  if (rows.length === 0) return <p className="quiet">No invoices yet.</p>;

  return (
    <>
      <ul className={styles.list}>
        {rows.map((row) => (
          <LedgerRow key={row.id} row={row} onPayment={setOpen} />
        ))}
      </ul>
      {open && (
        <PaymentSheet
          row={open}
          today={today}
          onClose={() => setOpen(null)}
          onSaved={() => {
            setOpen(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
