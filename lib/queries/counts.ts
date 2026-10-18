// Job: read the latest shelf count per product and append new count rows.
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
