// Job: the Open / Outstanding / This month stat row.
import { formatUSD } from "@/lib/money";
import styles from "./StatRow.module.css";

export function StatRow({ open, outstandingCents, thisMonthCents }: { open: number; outstandingCents: number; thisMonthCents: number }) {
  const stats = [
    { label: "Open", value: String(open) },
    { label: "Outstanding", value: formatUSD(outstandingCents) },
    { label: "This month", value: formatUSD(thisMonthCents) },
  ];
  return (
    <dl className={styles.stats}>
      {stats.map((s) => (
        <div key={s.label} className={styles.stat}>
          <dt className="label muted">{s.label}</dt>
          <dd className={styles.value}>{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
