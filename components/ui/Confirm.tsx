// Job: a one-question confirm sheet with Cancel and a confirm action.
"use client";

import { Sheet } from "./Sheet";
import styles from "./Sheet.module.css";

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
    <Sheet label={message} onClose={onCancel} role="alertdialog">
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button className="btn" type="button" onClick={onCancel} autoFocus>
          Cancel
        </button>
        <button className="btn btn-primary" type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}
