// Job: wipe the database and load the mock data (mock environments only).
import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { addDays, todayPacific } from "../lib/dates";
import { suggestNumber } from "../lib/invoice-number";

async function main() {
  const { db, schema } = await import("../db/client");
  // Loaded after dotenv so DATABASE_URL from .env.local is set before the client connects.
  const { mockCounts, mockCustomers, mockInvoices, mockProducts } = await import("./mock-data");

  await db.execute(sql`truncate invoice_lines, invoices, counts, products, customers`);

  const products = await db
    .insert(schema.products)
    .values(mockProducts.map((p, sort) => ({ ...p, sort })))
    .returning();
  const productId = (slug: string) => {
    const p = products.find((x) => x.slug === slug);
    if (!p) throw new Error(`Unknown product slug: ${slug}`);
    return p.id;
  };

  const customers = await db.insert(schema.customers).values(mockCustomers).returning();
  const customerId = (code: number) => customers.find((c) => c.code === code)!.id;

  const today = todayPacific();
  await db.insert(schema.counts).values(
    mockCounts.map((c) => ({
      customerId: customerId(c.code),
      productId: productId(c.slug),
      quantity: c.quantity,
      countedOn: addDays(today, -c.daysAgo),
    })),
  );

  for (const mock of mockInvoices) {
    const cafe = customers.find((c) => c.code === mock.code)!;
    const invoiceDate = addDays(today, -mock.daysAgo);
    const [invoice] = await db
      .insert(schema.invoices)
      .values({
        number: suggestNumber(cafe.code, invoiceDate),
        customerId: cafe.id,
        invoiceDate,
        cafeName: cafe.name,
        cafePhone: cafe.phone,
        cafeAddressLines: cafe.addressLines,
        cafeEmail: cafe.billingEmail,
        cafeLogoPath: cafe.logoPath,
        paidOn: mock.paidDaysAgo === null ? null : addDays(today, -mock.paidDaysAgo),
        paidReference: mock.reference,
      })
      .returning({ id: schema.invoices.id });
    await db.insert(schema.invoiceLines).values(
      mock.lines.map(([slug, quantity], position) => {
        const product = products.find((p) => p.slug === slug)!;
        return { invoiceId: invoice.id, productId: product.id, description: product.name, unitPriceCents: product.priceCents, quantity, position };
      }),
    );
  }

  console.log(`Seeded ${customers.length} cafes, ${products.length} products, ${mockCounts.length} counts, ${mockInvoices.length} invoices.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
