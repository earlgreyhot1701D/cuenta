// Job: the Invoice screen's action buttons (Print now; PDF, Email, Edit and Void join in later slices).
"use client";

import styles from "./InvoiceActions.module.css";

export function InvoiceActions() {
  return (
    <div className={styles.actions} data-print-hide>
      <button className="btn btn-primary" type="button" onClick={() => window.print()}>
        Print
      </button>
    </div>
  );
}
