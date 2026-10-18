// Job: create the Drizzle client for Neon (WebSocket pool, so transactions work).
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { customers } from "./schema/customers";
import { products } from "./schema/products";
import { standingItems } from "./schema/standing-items";
import { counts } from "./schema/counts";
import { invoices } from "./schema/invoices";
import { invoiceLines } from "./schema/invoice-lines";

export const schema = { customers, products, standingItems, counts, invoices, invoiceLines };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle({ client: pool, schema });
