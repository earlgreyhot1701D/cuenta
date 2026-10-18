// Job: wipe the database and load the mock data (mock environments only).
import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { addDays, todayPacific } from "../lib/dates";
import { mockCounts, mockCustomers, mockProducts } from "./mock-data";

async function main() {
  const { db, schema } = await import("../db/client");

  await db.execute(sql`truncate invoice_lines, invoices, counts, standing_items, products, customers`);

  const products = await db.insert(schema.products).values(mockProducts).returning();
  const productId = (slug: string) => {
    const p = products.find((x) => x.slug === slug);
    if (!p) throw new Error(`Unknown product slug: ${slug}`);
    return p.id;
  };

  const customers = await db
    .insert(schema.customers)
    .values(mockCustomers.map(({ standing: _standing, ...c }) => c))
    .returning();
  const customerId = (code: number) => customers.find((c) => c.code === code)!.id;

  await db.insert(schema.standingItems).values(
    mockCustomers.flatMap((c) =>
      c.standing.map((slug, position) => ({ customerId: customerId(c.code), productId: productId(slug), position })),
    ),
  );

  const today = todayPacific();
  await db.insert(schema.counts).values(
    mockCounts.map((c) => ({
      customerId: customerId(c.code),
      productId: productId(c.slug),
      quantity: c.quantity,
      countedOn: addDays(today, -c.daysAgo),
    })),
  );

  console.log(`Seeded ${customers.length} cafes, ${products.length} products, ${mockCounts.length} counts.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
