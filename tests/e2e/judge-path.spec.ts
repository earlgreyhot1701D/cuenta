// Job: run the four-step judge path (Count, Deliver, Invoice, Ledger) for Corazon Cocina and time it.
//
// Env: E2E_BASE_URL (default http://localhost:3000), E2E_PIN (falls back to APP_PIN from .env.local),
// E2E_MANUAL_PIN=1 to type the PIN yourself in the browser window (run with --headed; nothing is stored),
// E2E_SEND=1 to really send the email (otherwise the pop-up is checked and cancelled),
// E2E_KEEP=1 to keep the test invoice (otherwise it is voided at the end, so stats stay honest).
import { config } from "dotenv";
import { expect, test } from "@playwright/test";

config({ path: ".env.local", quiet: true });

const CAFE = "Corazon Cocina";
const PRODUCT = "Strawberry Tres Leches Cake";
const JUDGE_PATH_LIMIT_MS = 3 * 60 * 1000;

test("judge path: Count → Deliver → Invoice (Print, Email) → Ledger, under three minutes", async ({ page }) => {
  const manualPin = process.env.E2E_MANUAL_PIN === "1";
  const pin = process.env.E2E_PIN || process.env.APP_PIN;
  test.skip(!manualPin && !pin, "Set E2E_PIN (or APP_PIN in .env.local), or E2E_MANUAL_PIN=1.");
  if (manualPin) test.setTimeout(JUDGE_PATH_LIMIT_MS + 5 * 60 * 1000);
  const number = `E2E-${Date.now()}`;
  let invoiceId = "";

  // Print opens the browser dialog; headless Chrome can't, so record the call instead.
  await page.addInitScript(() => {
    (window as unknown as { printed: number }).printed = 0;
    window.print = () => {
      (window as unknown as { printed: number }).printed += 1;
    };
  });

  const step = async (name: string, body: () => Promise<void>) => {
    const t = Date.now();
    await test.step(name, body);
    console.log(`${name}: ${((Date.now() - t) / 1000).toFixed(1)}s`);
  };

  await step("PIN", async () => {
    await page.goto("/pin");
    if (manualPin) {
      console.log("Type the PIN in the browser window and press Enter (5 minutes).");
      await page.waitForURL(/\/count/, { timeout: 5 * 60 * 1000 });
    } else {
      await page.getByLabel("PIN").fill(pin!);
      await page.getByRole("button", { name: "Enter" }).click();
      await page.waitForURL(/\/count/);
    }
  });

  // The judge path is Count through Ledger; the PIN is a one-time step per device.
  const started = Date.now();

  try {
    await step("1. Count", async () => {
      const cafe = page.getByRole("radio", { name: new RegExp(CAFE) }).first();
      await cafe.click();
      await expect(cafe).toHaveAttribute("aria-checked", "true");
      await page.getByRole("textbox", { name: PRODUCT, exact: true }).fill("3");
      await page.getByRole("button", { name: "Save count" }).click();
      await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
    });

    await step("2. Deliver", async () => {
      await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Deliver" }).click();
      await expect(page).toHaveURL(/\/deliver$/);
      await expect(page.getByRole("heading", { name: "New Delivery" })).toBeVisible();
      await page.getByRole("radio", { name: new RegExp(CAFE) }).first().click();
      await page.getByLabel(`Quantity for ${PRODUCT}`).fill("4");
      await page.getByLabel("Invoice #").fill(number);
      await expect(page.getByText("$19.00").first()).toBeVisible();
      await page.getByRole("button", { name: "Create invoice" }).click();
      await page.waitForURL(/\/invoices\/[0-9a-f-]{36}$/);
      invoiceId = page.url().split("/").pop()!;
    });

    await step("3. Invoice: Print and Email", async () => {
      await expect(page.getByRole("heading", { name: `Invoice ${number}` })).toBeVisible();
      await page.getByRole("button", { name: "Print" }).click();
      await expect.poll(() => page.evaluate(() => (window as unknown as { printed: number }).printed)).toBe(1);

      await page.getByRole("button", { name: /^Send (email|again)$/ }).click();
      await expect(page.getByLabel("To")).not.toHaveValue("");
      if (process.env.E2E_SEND === "1") {
        await page.getByRole("button", { name: /^Send (email|again)$/ }).last().click();
        await expect(page.getByRole("button", { name: "Sending…" })).toBeDisabled();
        await expect(page.getByText(/Last sent/).first()).toBeVisible({ timeout: 30_000 });
      } else {
        await page.getByRole("button", { name: "Cancel" }).click();
      }
    });

    await step("4. Ledger: mark paid", async () => {
      await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Ledger" }).click();
      await expect(page).toHaveURL(/\/ledger$/);
      await page.getByRole("navigation", { name: "Filter by cafe" }).getByRole("link", { name: CAFE, exact: true }).click();
      await expect(page.getByRole("link", { name: CAFE, exact: true })).toHaveAttribute("aria-current", "page");
      const row = page.getByRole("listitem").filter({ hasText: number });
      await expect(row).toContainText("$19.00");
      await row.getByRole("button", { name: "Unpaid" }).click();
      await page.getByRole("button", { name: "Mark paid" }).click();
      await expect(row.getByRole("button", { name: /^Paid / })).toBeVisible();
    });

    const total = Date.now() - started;
    console.log(`Judge path total: ${(total / 1000).toFixed(1)}s (limit ${JUDGE_PATH_LIMIT_MS / 1000}s)`);
    test.info().annotations.push({ type: "judge-path-ms", description: String(total) });
    expect(total).toBeLessThan(JUDGE_PATH_LIMIT_MS);
  } finally {
    if (invoiceId && process.env.E2E_KEEP !== "1") {
      const res = await page.request.post(`/api/invoices/${invoiceId}/void`);
      console.log(`Cleanup: voided ${number} (${res.status()})`);
    }
  }
});
