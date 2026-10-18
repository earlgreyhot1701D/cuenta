// Job: mint and verify 60-second print tokens scoped to one invoice.
import { createHmac, timingSafeEqual } from "node:crypto";

export const PRINT_TOKEN_SECONDS = 60;

function sign(invoiceId: string, exp: number): string {
  const secret = process.env.PRINT_TOKEN_SECRET;
  if (!secret) throw new Error("PRINT_TOKEN_SECRET is not set");
  return createHmac("sha256", secret).update(`${invoiceId}.${exp}`).digest("base64url");
}

/** A token of the form "exp.signature" that only opens this invoice, until it expires. */
export function mintPrintToken(invoiceId: string, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + PRINT_TOKEN_SECONDS;
  return `${exp}.${sign(invoiceId, exp)}`;
}

export function verifyPrintToken(invoiceId: string, token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const [expText, sig] = token.split(".");
  const exp = Number(expText);
  if (!Number.isInteger(exp) || !sig || exp < Math.floor(now / 1000)) return false;
  const expected = Buffer.from(sign(invoiceId, exp));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
