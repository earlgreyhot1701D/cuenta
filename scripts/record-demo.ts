// Job: record the demo video of the judge path on production, signed in without showing the PIN screen.
//
// Run: DEMO_BASE_URL=<app address> npx tsx scripts/record-demo.ts   (not part of the app; nothing imports it)
// 1. A headed window opens on /pin. Type the PIN there. Its sign-in is saved to .demo-auth.json (gitignored).
// 2. A new, already signed-in window records Count → Deliver → Invoice → Download PDF → Email → Ledger → Customers → Ledger.
// 3. The sign-in file is deleted at the end, even on failure. The raw video lands in demo-raw/ (gitignored).
// Dry run: DEMO_BASE_URL=http://localhost:3107 DEMO_SKIP_SIGNIN=1 with a .demo-auth.json made for that server.
// It writes mock data to production: one count, one invoice (emailed to the mock cafe, marked paid).
import { chromium, type Locator, type Page } from "@playwright/test";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/** The app's address comes only from DEMO_BASE_URL, so the repo never names the live app. */
function requireBaseUrl(): string {
  const base = process.env.DEMO_BASE_URL?.trim();
  if (!base) throw new Error("Set DEMO_BASE_URL to the app's address (for example http://localhost:3107).");
  return base;
}

const BASE = requireBaseUrl();
const AUTH = path.resolve(".demo-auth.json");
const RAW = path.resolve("demo-raw");
const SIZE = { width: 1280, height: 800 };
const HOLD = 3000;
/** Stretches every hold evenly, to land the video at 85–95 seconds on production. */
const PACE = 1.15;
const CAFE = /Corazon Cocina/;

/** A cursor dot and click ripple, injected into the recording browser only, so viewers can see what's tapped. */
const CURSOR = `(() => {
  const install = () => {
    if (document.getElementById("demo-cursor")) return;
    const dot = document.createElement("div");
    dot.id = "demo-cursor";
    const saved = JSON.parse(sessionStorage.getItem("demo-cursor") || '{"x":640,"y":400}');
    Object.assign(dot.style, { position: "fixed", left: saved.x + "px", top: saved.y + "px", width: "18px", height: "18px",
      margin: "-9px 0 0 -9px", borderRadius: "50%", background: "rgba(138,75,63,.85)", border: "2px solid #fff",
      boxShadow: "0 0 0 1px rgba(0,0,0,.35)", zIndex: 2147483647, pointerEvents: "none" });
    document.documentElement.appendChild(dot);
    addEventListener("mousemove", (e) => {
      dot.style.left = e.clientX + "px"; dot.style.top = e.clientY + "px";
      sessionStorage.setItem("demo-cursor", JSON.stringify({ x: e.clientX, y: e.clientY }));
    }, true);
    addEventListener("mousedown", (e) => {
      const r = document.createElement("div");
      Object.assign(r.style, { position: "fixed", left: e.clientX + "px", top: e.clientY + "px", width: "44px", height: "44px",
        margin: "-22px 0 0 -22px", borderRadius: "50%", border: "3px solid rgba(138,75,63,.9)", zIndex: 2147483646,
        pointerEvents: "none", transition: "transform .45s ease-out, opacity .45s ease-out" });
      document.documentElement.appendChild(r);
      requestAnimationFrame(() => { r.style.transform = "scale(1.8)"; r.style.opacity = "0"; });
      setTimeout(() => r.remove(), 500);
    }, true);
  };
  if (document.documentElement) install(); else addEventListener("DOMContentLoaded", install);
})();`;

let mouse = { x: 640, y: 400 };

async function glideTo(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) throw new Error("Nothing to point at");
  const to = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(mouse.x, mouse.y);
  await page.mouse.move(to.x, to.y, { steps: 40 });
  mouse = to;
  await page.waitForTimeout(450);
}

async function tap(page: Page, target: Locator) {
  await glideTo(page, target);
  await target.click({ delay: 60 });
}

async function type(page: Page, target: Locator, text: string, opts: { append?: boolean } = {}) {
  await tap(page, target);
  if (opts.append) await target.press("End");
  await target.pressSequentially(text, { delay: 120 });
}

const hold = (page: Page, ms = HOLD) => page.waitForTimeout(Math.round(ms * PACE));

async function signIn() {
  const browser = await chromium.launch({ headless: false });
  try {
    const context = await browser.newContext({ viewport: SIZE });
    const page = await context.newPage();
    await page.goto(`${BASE}/pin`);
    await page.bringToFront();
    console.log("Type the PIN in the Chromium window and press Enter (5 minutes). This window is not recorded.");
    await page.waitForURL(/\/count/, { timeout: 5 * 60 * 1000 });
    await context.storageState({ path: AUTH });
    console.log("Signed in. Recording starts in a new window.");
  } finally {
    await browser.close();
  }
}

async function record() {
  mkdirSync(RAW, { recursive: true });
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: AUTH,
    viewport: SIZE,
    acceptDownloads: true,
    recordVideo: { dir: RAW, size: SIZE },
  });
  await context.addInitScript(CURSOR);
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);
  const nav = (label: string) => page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label });
  const started = Date.now();
  const mark = (shot: string) => console.log(`${((Date.now() - started) / 1000).toFixed(1).padStart(5)}s  ${shot}`);
  let number = "";
  let invoiceUrl = "";

  try {
    // 1. Count
    mark("1 Count");
    await page.goto(`${BASE}/count`);
    await page.getByRole("heading", { name: "Shelf Count" }).waitFor();
    await hold(page);
    const corazon = page.getByRole("radio", { name: CAFE }).first();
    await tap(page, corazon);
    await page.waitForFunction(() => document.querySelector('[role="radio"][aria-checked="true"]')?.textContent?.includes("Corazon Cocina"));
    await type(page, page.getByRole("textbox", { name: "Strawberry Tres Leches Cake", exact: true }), "3");
    await type(page, page.getByRole("textbox", { name: "Coconut Rice Pudding", exact: true }), "2");
    await hold(page, 700);
    await tap(page, page.getByRole("button", { name: "Save count" }));
    await page.getByRole("status").filter({ hasText: "Saved" }).waitFor();
    await hold(page);

    // 2. Deliver
    mark("2 Deliver");
    await tap(page, nav("Deliver"));
    await page.getByRole("heading", { name: "New Delivery" }).waitFor();
    await hold(page, 800);
    await tap(page, page.getByRole("radio", { name: CAFE }).first());
    await type(page, page.getByLabel("Quantity for Strawberry Tres Leches Cake"), "8");
    await type(page, page.getByLabel("Quantity for Coconut Tres Leches Cake"), "6");
    await type(page, page.getByLabel("Quantity for Pixie Tangerine/Orange Flan"), "6");
    const numberField = page.getByLabel("Invoice #");
    await type(page, numberField, "-2", { append: true });
    number = await numberField.inputValue();
    await hold(page);
    await tap(page, page.getByRole("button", { name: "Create invoice" }));
    await page.waitForURL(/\/invoices\/[0-9a-f-]{36}$/);
    invoiceUrl = page.url();

    // 3. Invoice
    mark(`3 Invoice ${number}`);
    await page.getByRole("heading", { name: `Invoice ${number}` }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    await hold(page, 3000);
    await page.getByText("INVOICE TOTAL").evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
    await hold(page, 3000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await hold(page, 900);

    // 4. Download PDF, then show it
    mark("4 Download PDF");
    const downloadButton = page.getByRole("button", { name: "Download PDF" });
    const downloading = page.waitForEvent("download", { timeout: 60_000 });
    await tap(page, downloadButton);
    const download = await downloading;
    const pdfPath = path.join(RAW, download.suggestedFilename());
    await download.saveAs(pdfPath);
    await hold(page, 700);
    await page.goto(`${pathToFileURL(pdfPath).href}#view=Fit`);
    await hold(page, 3500);

    // 5. Email
    mark("5 Email");
    await page.goto(invoiceUrl);
    await page.getByRole("heading", { name: `Invoice ${number}` }).waitFor();
    await hold(page, 800);
    await tap(page, page.getByRole("button", { name: /^Send (email|again)$/ }));
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("To").waitFor();
    await glideTo(page, dialog.getByLabel("To"));
    await hold(page, 3000);
    await tap(page, dialog.getByRole("button", { name: /^Send (email|again)$/ }));
    await page.getByRole("button", { name: "Sending…" }).waitFor({ timeout: 5_000 }).catch(() => {});
    await page.getByText(/^Last sent /).first().waitFor({ timeout: 60_000 });
    await hold(page, 3000);

    // 6. Ledger
    mark("6 Ledger");
    await tap(page, nav("Ledger"));
    await page.waitForURL(/\/ledger$/);
    await hold(page, 3000);
    const row = page.getByRole("listitem").filter({ hasText: number });
    await tap(page, row.getByRole("button", { name: "Unpaid" }));
    await page.getByRole("button", { name: "Mark paid" }).waitFor();
    await hold(page, 2000);
    await tap(page, page.getByRole("button", { name: "Mark paid" }));
    await row.getByRole("button", { name: /^Paid / }).waitFor();
    await hold(page, 3000);

    // 7. Customers
    mark("7 Customers");
    await tap(page, nav("Customers"));
    await page.getByRole("heading", { name: "Customers" }).waitFor();
    await hold(page, 3000);

    // Ending: back on the Ledger, so the video closes on who owes what.
    mark("8 Ledger (ending)");
    await tap(page, nav("Ledger"));
    await page.waitForURL(/\/ledger$/);
    await page.getByRole("heading", { name: "Ledger" }).waitFor();
    await hold(page, 3000);
    mark("end");
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();
    if (video) console.log(`RAW_VIDEO=${await video.path()}`);
    console.log(`INVOICE_NUMBER=${number}`);
    console.log(`INVOICE_URL=${invoiceUrl}`);
  }
}

async function main() {
  try {
    // DEMO_SKIP_SIGNIN=1 reuses an existing .demo-auth.json (for a local dry run against DEMO_BASE_URL).
    if (process.env.DEMO_SKIP_SIGNIN !== "1") await signIn();
    await record();
  } finally {
    if (existsSync(AUTH)) rmSync(AUTH);
    console.log(`Sign-in file removed: ${!existsSync(AUTH)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
