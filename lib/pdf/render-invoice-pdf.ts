// Job: turn the token-gated print route into a Letter PDF buffer, one PDF page per invoice page.
import { getBrowser } from "./browser";
import { mintPrintToken } from "@/lib/print-token";

/** Where headless Chrome loads the print page: APP_URL on Vercel, this server locally. */
export function printBaseUrl(requestUrl: string): string {
  return process.env.VERCEL && process.env.APP_URL ? process.env.APP_URL : new URL(requestUrl).origin;
}

export async function renderInvoicePdf(invoiceId: string, baseUrl: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 816, height: 1056 });
    const url = `${baseUrl}/print/invoice/${invoiceId}?t=${encodeURIComponent(mintPrintToken(invoiceId))}`;
    // Wait for what the PDF needs (page, fonts, images) rather than network silence, which dev-mode HMR never reaches.
    const res = await page.goto(url, { waitUntil: "load", timeout: 20_000 });
    if (!res?.ok()) throw new Error(`Print page returned ${res?.status() ?? "no response"}`);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    });
    const pdf = await page.pdf({ format: "Letter", printBackground: true, preferCSSPageSize: true });
    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => {});
  }
}
