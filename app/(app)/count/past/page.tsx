// Job: show one cafe's past counts, newest day first, read-only.
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatLong } from "@/lib/dates";
import { pastCounts } from "@/lib/queries/counts";
import { getCustomer } from "@/lib/queries/customers";
import styles from "./past.module.css";

export const dynamic = "force-dynamic";

export default async function PastCountsPage({ searchParams }: { searchParams: Promise<{ cafe?: string }> }) {
  const cafeId = (await searchParams).cafe;
  const cafe = cafeId && /^[0-9a-f-]{36}$/i.test(cafeId) ? await getCustomer(cafeId) : undefined;
  if (!cafe) notFound();
  const days = await pastCounts(cafe.id);

  return (
    <>
      <Link href={`/count?cafe=${cafe.id}`} className={`label ${styles.back}`}>
        ← Back to Count
      </Link>
      <h1>Past Counts</h1>
      <p className="quiet">{cafe.name}</p>
      {days.length === 0 ? (
        <p className="quiet">No counts yet.</p>
      ) : (
        days.map((day) => (
          <section key={day.countedOn} className={styles.day}>
            <h2 className={`label ${styles.date}`}>{formatLong(day.countedOn)}</h2>
            <ul className={styles.rows}>
              {day.rows.map((row) => (
                <li key={row.productId} className={styles.row}>
                  <span>{row.name}</span>
                  <span className={styles.qty}>{row.quantity}</span>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
