// Job: read cafes from the database.
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";

export type Customer = typeof schema.customers.$inferSelect;

export async function listCustomers(): Promise<Customer[]> {
  return db.select().from(schema.customers).orderBy(asc(schema.customers.sort));
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  const [row] = await db.select().from(schema.customers).where(eq(schema.customers.id, id));
  return row;
}
