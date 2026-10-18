// Job: a − / number / + input that starts blank and never goes below zero.
"use client";

import styles from "./Stepper.module.css";

/** `value` is "" (blank) or a whole number as text. */
export function Stepper({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const n = value === "" ? null : Number(value);
  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.step}
        aria-label={`Less ${label}`}
        onClick={() => onChange(n === null ? "0" : String(Math.max(0, n - 1)))}
      >
        −
      </button>
      <input
        className={styles.value}
        inputMode="numeric"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
      />
      <button
        type="button"
        className={styles.step}
        aria-label={`More ${label}`}
        onClick={() => onChange(String((n ?? 0) + 1))}
      >
        +
      </button>
    </div>
  );
}
