// Job: pick one cafe from a grid of location cards.
"use client";

import styles from "./CafePicker.module.css";

export type CafeOption = { id: string; code: number; name: string };

export function CafePicker({
  cafes,
  selectedId,
  onSelect,
}: {
  cafes: CafeOption[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={styles.grid} role="radiogroup" aria-label="Cafe">
      {cafes.map((cafe) => {
        const selected = cafe.id === selectedId;
        return (
          <button
            key={cafe.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`${styles.card} ${selected ? styles.selected : ""}`}
            onClick={() => !selected && onSelect(cafe.id)}
          >
            <span className="label">Loc {String(cafe.code).padStart(2, "0")}</span>
            <span className={styles.name}>{cafe.name}</span>
          </button>
        );
      })}
    </div>
  );
}
