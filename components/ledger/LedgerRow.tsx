// Job: one ledger row in its unpaid, overdue, paid or void state; tapping it opens the invoice.
import Link from "next/link";
import { formatShort } from "@/lib/dates";
import { formatUSD } from "@/lib/money";
import type { LedgerStatus } from "@/lib/ledger-stats";
import styles from "./LedgerRow.module.css";

export type LedgerRowData = {
  id: string;
  number: string;
  cafeName: string;
  invoiceDate: string;
  dueOn: string;
  overdueDays: number;
  totalCents: number;
  status: LedgerStatus;
  paidOn: string | null;
  paidReference: string | null;
  /** "Emailed Oct 17" with its full time, or "Not sent"; null if never tried. */
  email: { short: string; full: string } | null;
};

/** The envelope always comes with words she can read; the full time shows on hover and to screen readers. */
function EmailMark({ email }: { email: { short: string; full: string } }) {
  return (
    <span className={styles.email} title={email.full} aria-label={email.full}>
      <svg viewBox="0 0 16 12" width="14" height="11" aria-hidden="true">
        <rect x="0.5" y="0.5" width="15" height="11" fill="none" stroke="currentColor" />
        <path d="M0.5 0.5 L8 7 L15.5 0.5" fill="none" stroke="currentColor" />
      </svg>
      <span aria-hidden="true">{email.short}</span>
    </span>
  );
}

export function LedgerRow({ row, onPayment }: { row: LedgerRowData; onPayment: (row: LedgerRowData) => void }) {
  const overdue = row.overdueDays > 0;
  return (
    <li className={`${styles.row} ${styles[row.status]} ${overdue ? styles.overdue : ""}`}>
      <Link href={`/invoices/${row.id}`} className={styles.main}>
        <span className={styles.top}>
          <span className={styles.number}>{row.number}</span>
          {row.status === "void" && <span className={`label ${styles.stamp}`}>Void</span>}
        </span>
        <span className={styles.cafe}>{row.cafeName}</span>
        {row.email && <EmailMark email={row.email} />}
        <span className={`label ${styles.dates}`}>
          {formatShort(row.invoiceDate)} ·{" "}
          <span className={overdue ? styles.due : undefined}>Due {formatShort(row.dueOn)}</span>
          {overdue && <span className={styles.due}> · overdue {row.overdueDays} {row.overdueDays === 1 ? "day" : "days"}</span>}
        </span>
      </Link>
      <div className={styles.side}>
        <span className={styles.total}>{formatUSD(row.totalCents)}</span>
        {row.status === "unpaid" && (
          <button type="button" className={`btn ${styles.pay}`} onClick={() => onPayment(row)}>
            Unpaid
          </button>
        )}
        {row.status === "paid" && row.paidOn && (
          <>
            <button type="button" className={`btn ${styles.pay} ${styles.paidBtn}`} onClick={() => onPayment(row)}>
              Paid {formatShort(row.paidOn)}
            </button>
            {row.paidReference && <span className={styles.ref}>{row.paidReference}</span>}
          </>
        )}
      </div>
    </li>
  );
}
