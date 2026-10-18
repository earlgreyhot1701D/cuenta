// Job: fail if any tracked file carries real customer or business data instead of the mock data (Block 6 audit).
//
// Real values are never written here. They're read at run time from local-only files that git ignores:
// the Stitch mockups (design/*.html), which hold real cafe contacts, and .env.local (the learner's inbox).
// Run: node scripts/audit-mock-data.mjs
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const problems = [];
const fail = (msg) => problems.push(msg);

// 1. Files that must never be tracked.
const forbidden = [
  [/^design\/canva-invoice-reference\.png$/, "the Canva reference PNG (real customer details)"],
  [/^design\/.*\.(html|png)$/, "a Stitch mockup (real contact details)"],
  [/^devpost\/learner-profile\.md$/, "the private learner profile"],
  [/^private\//, "the private folder (real logos and seed data)"],
  [/(^|\/)\.env(\..+)?$/, "a local env file"],
];
for (const file of tracked) {
  if (file === ".env.example") continue;
  for (const [pattern, what] of forbidden) if (pattern.test(file)) fail(`tracked: ${file} is ${what}`);
}

// 2. The only cafe logo in the repo is the generated placeholder.
for (const file of tracked.filter((f) => f.startsWith("public/logos/"))) {
  if (file !== "public/logos/placeholder.png") fail(`tracked: ${file} (only the placeholder logo may be committed)`);
}

// 3. Real values from local-only sources must not appear in any tracked text file.
const real = new Set();
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE = /\(?\b\d{3}\)?[\s.-]\d{3}-\d{4}\b/g;
const STREET = /\b\d{2,5} (?:[A-Z][a-z]+ ){1,3}(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Boulevard|Blvd|Drive|Dr)\b/g;
if (existsSync("design")) {
  for (const f of readdirSync("design").filter((n) => n.endsWith(".html"))) {
    const text = readFileSync(`design/${f}`, "utf8").replace(/<[^>]+>/g, " ");
    for (const re of [EMAIL, PHONE, STREET]) for (const m of text.match(re) ?? []) real.add(m);
  }
}
if (existsSync(".env.local")) {
  const env = readFileSync(".env.local", "utf8");
  for (const key of ["SEED_BILLING_EMAIL", "EMAIL_REPLY_TO"]) {
    const value = env.match(new RegExp(`^${key}=["']?([^"'\\r\\n]+)`, "m"))?.[1]?.trim();
    if (value) real.add(value);
  }
}
// Mock values and public addresses that are fine to appear anywhere.
const allowed = (v) => /example\.(com|org)$|@resend\.dev$|@lacondesabakingcompany\.com$|\b555-01\d\d\b|Example/.test(v);
const realValues = [...real].filter((v) => !allowed(v));

const isText = (f) => !/\.(png|ico|jpg|jpeg|webp|woff2?|pdf)$/i.test(f) && f !== "package-lock.json";
for (const file of tracked.filter(isText)) {
  if (!existsSync(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const value of realValues) if (text.includes(value)) fail(`${file}: contains a real value from a local-only source (${value.length} chars, starts "${value.slice(0, 3)}…")`);
  // Any phone number in a tracked file must be a 555 mock number.
  for (const m of text.match(PHONE) ?? []) if (!/555-01\d\d/.test(m)) fail(`${file}: phone-like value "${m}"`);
}

// 4. Footer identity in the committed example env is placeholder only.
const example = existsSync(".env.example") ? readFileSync(".env.example", "utf8") : "";
for (const line of example.split(/\r?\n/)) {
  const [key, ...rest] = line.split("=");
  const value = rest.join("=").trim();
  if (key?.startsWith("BUSINESS_") && value && !/Example|555-01\d\d|example\.com/.test(value)) {
    fail(`.env.example: ${key} doesn't look like a placeholder`);
  }
}

console.log(`Checked ${tracked.length} tracked files against ${realValues.length} real values from local-only sources.`);
if (realValues.length === 0) console.log("Note: no local-only sources found (design/*.html, .env.local); only the file and pattern checks ran.");
if (problems.length) {
  console.log(`FAIL: ${problems.length} problem(s)`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log("PASS: mock data only. No real logo, no real footer, no reference PNG, no real contacts.");
