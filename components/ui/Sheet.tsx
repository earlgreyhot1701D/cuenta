// Job: a blush sheet that rises over the current screen; tapping outside closes it.
"use client";

import styles from "./Sheet.module.css";

export function Sheet({
  label,
  onClose,
  role = "dialog",
  children,
}: {
  label: string;
  onClose: () => void;
  role?: "dialog" | "alertdialog";
  children: React.ReactNode;
}) {
  return (
    <div className={styles.backdrop} onClick={onClose} data-print-hide>
      <div className={styles.sheet} role={role} aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
