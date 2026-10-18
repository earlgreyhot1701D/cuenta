// Job: one free-text special order line: description, unit price, quantity, line total and Remove.
"use client";

import { formatUSD } from "@/lib/money";
import lineStyles from "./LineRow.module.css";
import styles from "./SpecialOrderRow.module.css";

export function SpecialOrderRow({
  description,
  price,
  quantity,
  totalCents,
  descriptionInvalid,
  priceInvalid,
  quantityInvalid,
  onDescription,
  onPrice,
  onQuantity,
  onRemove,
}: {
  description: string;
  price: string;
  quantity: string;
  totalCents: number | null;
  descriptionInvalid: boolean;
  priceInvalid: boolean;
  quantityInvalid: boolean;
  onDescription: (value: string) => void;
  onPrice: (value: string) => void;
  onQuantity: (value: string) => void;
  onRemove: () => void;
}) {
  const name = description.trim() || "special order";
  return (
    <li className={lineStyles.row}>
      <div className={lineStyles.desc}>
        <input
          className={`field ${styles.description} ${descriptionInvalid ? lineStyles.invalid : ""}`}
          placeholder="Special order description"
          aria-label="Special order description"
          aria-invalid={descriptionInvalid}
          maxLength={80}
          value={description}
          onChange={(e) => onDescription(e.target.value)}
        />
        <button type="button" className={`label ${styles.remove}`} onClick={onRemove}>
          Remove
        </button>
      </div>
      <label className={lineStyles.price}>
        <span className={`label ${lineStyles.mobileLabel}`}>Price</span>
        <span className={lineStyles.dollar}>$</span>
        <input
          className={`field ${priceInvalid ? lineStyles.invalid : ""}`}
          inputMode="decimal"
          aria-label={`Price for ${name}`}
          aria-invalid={priceInvalid}
          value={price}
          onChange={(e) => onPrice(e.target.value)}
        />
      </label>
      <label className={lineStyles.qty}>
        <span className={`label ${lineStyles.mobileLabel}`}>Qty</span>
        <input
          className={`field ${quantityInvalid ? lineStyles.invalid : ""}`}
          inputMode="numeric"
          aria-label={`Quantity for ${name}`}
          aria-invalid={quantityInvalid}
          value={quantity}
          onChange={(e) => onQuantity(e.target.value.replace(/\D/g, "").slice(0, 4))}
        />
      </label>
      <span className={lineStyles.total}>{totalCents === null ? "" : formatUSD(totalCents)}</span>
    </li>
  );
}
