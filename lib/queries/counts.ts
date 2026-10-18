// Job: read shelf counts (latest per product, or every past day) and append new count rows.
import { sql } from "drizzle-orm";
import { db, schema } from "@/db/client";

export type LatestCount = { productId: string; quantity: number; countedOn: string };

/** Newest count row per product for one cafe. */
export async function latestCounts(customerId: string): Promise<Map<string, LatestCount>> {
  const result = await db.execute<{ product_id: string; quantity: number; counted_on: string }>(sql`
    select distinct on (product_id) product_id, quantity, counted_on::text as counted_on
    from counts
    where customer_id = ${customerId}
    order by product_id, counted_on desc, created_at desc
  `);
  return new Map(
    result.rows.map((r) => [r.product_id, { productId: r.product_id, quantity: r.quantity, countedOn: r.counted_on }]),
  );
}

/** Adds one count row per entry, all dated `countedOn`. */
export async function insertCounts(
  customerId: string,
  countedOn: string,
  entries: { productId: string; quantity: number }[],
): Promise<void> {
  await db.insert(schema.counts).values(entries.map((e) => ({ customerId, countedOn, ...e })));
}

export type PastCountDay = { countedOn: string; rows: { productId: string; name: string; quantity: number }[] };

/**
 * Every day this cafe was counted, newest first. Within a day, rows follow the standing list
 * (products since taken off it go last); if a product was saved twice that day, the later save wins.
 */
export async function pastCounts(customerId: string): Promise<PastCountDay[]> {
  const result = await db.execute<{ counted_on: string; product_id: string; name: string; quantity: number }>(sql`
    select counted_on, product_id, name, quantity from (
      select distinct on (c.counted_on, c.product_id)
        c.counted_on::text as counted_on, c.product_id, p.name, c.quantity,
        coalesce(s.position, 1000000) as position
      from counts c
      join products p on p.id = c.product_id
      left join standing_items s on s.customer_id = c.customer_id and s.product_id = c.product_id
      where c.customer_id = ${customerId}
      order by c.counted_on, c.product_id, c.created_at desc
    ) latest
    order by counted_on desc, position, name
  `);
  const days: PastCountDay[] = [];
  for (const r of result.rows) {
    let day = days[days.length - 1];
    if (!day || day.countedOn !== r.counted_on) {
      day = { countedOn: r.counted_on, rows: [] };
      days.push(day);
    }
    day.rows.push({ productId: r.product_id, name: r.name, quantity: r.quantity });
  }
  return days;
}
