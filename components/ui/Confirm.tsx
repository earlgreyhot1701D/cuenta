// Job: a one-question confirm sheet with Cancel and a confirm action.
"use client";

import styles from "./Confirm.module.css";

export function Confirm({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div
        className={styles.sheet}
        role="alertdialog"
        aria-modal="true"
        aria-label={message}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className="btn" type="button" onClick={onCancel} autoFocus>
            Cancel
          </button>
          <button className="btn btn-primary" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
