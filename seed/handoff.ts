// Job: load Eileen's real menu and cafes from the gitignored private/ files into one named database (Handoff step 5b).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const USAGE = "Usage: HANDOFF_DATABASE_URL=<connection string> npx tsx seed/handoff.ts --target dev|main";

type HandoffProduct = { slug: string; name: string; priceCents: number };
type HandoffCafe = {
  code: number;
  name: string;
  phone: string;
  addressLines: string[];
  billingEmail: string | null;
  logoFile: string | null;
  sort: number;
};

function parseTarget(argv: string[]): "dev" | "main" {
  const i = argv.indexOf("--target");
  const target = i >= 0 ? argv[i + 1] : undefined;
  if (target !== "dev" && target !== "main") throw new Error(USAGE);
  return target;
}

/** private/ is never in git, so it's loaded by path: a clean clone still type-checks without it. */
async function loadPrivate<T>(file: string, name: string): Promise<T> {
  const mod = await import(pathToFileURL(path.join(process.cwd(), "private", file)).href);
  if (!mod[name]) throw new Error(`private/${file} has no export named ${name}`);
  return mod[name] as T;
}

/** The logo goes into the cafe record itself, so it never needs a file in git or on Vercel. */
function logoDataUri(file: string): string {
  const bytes = fs.readFileSync(path.join(process.cwd(), "private", file));
  if (bytes.subarray(1, 4).toString("latin1") !== "PNG") throw new Error(`private/${file} is not a PNG`);
  if (bytes.length > 100_000) throw new Error(`private/${file} is over 100 KB`);
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

function validate(products: HandoffProduct[], cafes: HandoffCafe[]): void {
  const slugs = new Set(products.map((p) => p.slug));
  if (slugs.size !== products.length) throw new Error("Duplicate product slug");
  for (const p of products) {
    if (!p.name.trim() || !Number.isInteger(p.priceCents) || p.priceCents <= 0) throw new Error(`Check product ${p.slug}`);
  }
  const codes = new Set(cafes.map((c) => c.code));
  if (codes.size !== cafes.length) throw new Error("Duplicate cafe code");
  for (const c of cafes) {
    if (!c.name.trim() || !c.phone.trim() || c.addressLines.length === 0) throw new Error(`Check cafe ${c.code}`);
    // An empty billing email is allowed: test mode sends to EMAIL_TEST_TO until real emails are added (Handoff step 8).
  }
}

async function main() {
  const target = parseTarget(process.argv.slice(2));
  const url = process.env.HANDOFF_DATABASE_URL;
  if (!url) throw new Error(USAGE);
  // The app's client reads DATABASE_URL. This script never loads .env.local, so it can only reach the database named here.
  process.env.DATABASE_URL = url;
  console.log(`Target: ${target} (endpoint ${new URL(url).hostname.split(".")[0]})`);

  const products = await loadPrivate<HandoffProduct[]>("menu.ts", "handoffProducts");
  const cafes = await loadPrivate<HandoffCafe[]>("cafes.ts", "handoffCafes");
  validate(products, cafes);

  const { db, schema } = await import("../db/client");
  const { count } = await import("drizzle-orm");

  await db.transaction(async (tx) => {
    const [{ n: invoices }] = await tx.select({ n: count() }).from(schema.invoices);
    const [{ n: counts }] = await tx.select({ n: count() }).from(schema.counts);
    if (invoices || counts) {
      throw new Error(`Refusing: ${target} has ${invoices} invoices and ${counts} counts. Clear the demo data first (Handoff step 4).`);
    }
    await tx.delete(schema.products);
    await tx.delete(schema.customers);
    await tx.insert(schema.products).values(products.map((p, sort) => ({ ...p, sort })));
    await tx.insert(schema.customers).values(
      cafes.map(({ logoFile, ...c }) => ({ ...c, logoPath: logoFile ? logoDataUri(logoFile) : null })),
    );
  });

  const menu = await db.select().from(schema.products).orderBy(schema.products.sort);
  const loaded = await db.select().from(schema.customers).orderBy(schema.customers.sort);
  console.log(`Loaded ${menu.length} products and ${loaded.length} cafes into ${target}:`);
  for (const c of loaded) {
    console.log(`  ${c.code}. ${c.name} · ${c.addressLines.length} address lines · logo ${c.logoPath ? "yes" : "no"} · email ${c.billingEmail ? "set" : "empty"}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
