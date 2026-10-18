// Job: one editable invoice line: name, grey shelf count, unit price, quantity and line total.
"use client";

import { formatShort } from "@/lib/dates";
import { formatUSD } from "@/lib/money";
import styles from "./LineRow.module.css";

export function LineRow({
  name,
  shelf,
  price,
  quantity,
  totalCents,
  priceInvalid,
  onPrice,
  onQuantity,
}: {
  name: string;
  shelf: { quantity: number; countedOn: string } | null;
  price: string;
  quantity: string;
  totalCents: number | null;
  priceInvalid: boolean;
  onPrice: (value: string) => void;
  onQuantity: (value: string) => void;
}) {
  return (
    <li className={styles.row}>
      <div className={styles.desc}>
        <span className={styles.name}>{name}</span>
        <span className={`label ${styles.shelf}`}>
          {shelf ? `shelf ${formatShort(shelf.countedOn)}: ${shelf.quantity}` : "not counted yet"}
        </span>
      </div>
      <label className={styles.price}>
        <span className={`label ${styles.mobileLabel}`}>Price</span>
        <span className={styles.dollar}>$</span>
        <input
          className={`field ${priceInvalid ? styles.invalid : ""}`}
          inputMode="decimal"
          aria-label={`Price for ${name}`}
          aria-invalid={priceInvalid}
          value={price}
          onChange={(e) => onPrice(e.target.value)}
        />
      </label>
      <label className={styles.qty}>
        <span className={`label ${styles.mobileLabel}`}>Qty</span>
        <input
          className="field"
          inputMode="numeric"
          aria-label={`Quantity for ${name}`}
          value={quantity}
          onChange={(e) => onQuantity(e.target.value.replace(/\D/g, "").slice(0, 4))}
        />
      </label>
      <span className={styles.total}>{totalCents === null ? "" : formatUSD(totalCents)}</span>
    </li>
  );
}
