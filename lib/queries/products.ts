// Job: read the menu: every active product, in menu order, the same for every cafe.
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";

export type Product = { productId: string; slug: string; name: string; priceCents: number };

export async function listProducts(): Promise<Product[]> {
  const { products } = schema;
  return db
    .select({ productId: products.id, slug: products.slug, name: products.name, priceCents: products.priceCents })
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.sort), asc(products.name));
}
