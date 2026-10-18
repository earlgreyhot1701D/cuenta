// Job: read a cafe's standing products, in standing-list order.
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";

export type StandingProduct = { productId: string; slug: string; name: string; priceCents: number };

export async function standingProducts(customerId: string): Promise<StandingProduct[]> {
  const { products, standingItems } = schema;
  return db
    .select({ productId: products.id, slug: products.slug, name: products.name, priceCents: products.priceCents })
    .from(standingItems)
    .innerJoin(products, eq(products.id, standingItems.productId))
    .where(and(eq(standingItems.customerId, customerId), eq(products.active, true)))
    .orderBy(asc(standingItems.position));
}
