// Job: check print tokens open only their own invoice, and only for 60 seconds.
import { beforeAll, describe, expect, it } from "vitest";
import { mintPrintToken, verifyPrintToken } from "@/lib/print-token";

beforeAll(() => {
  process.env.PRINT_TOKEN_SECRET = "test-print-secret";
});

const A = "00d3238c-b34c-479d-9519-77624b7da3b7";
const B = "d6ada6f3-12e1-4964-9458-a351f449cfb6";

describe("print tokens", () => {
  it("opens the invoice it was minted for", () => {
    expect(verifyPrintToken(A, mintPrintToken(A))).toBe(true);
  });
  it("refuses another invoice", () => {
    expect(verifyPrintToken(B, mintPrintToken(A))).toBe(false);
  });
  it("expires after 60 seconds", () => {
    const now = Date.now();
    const token = mintPrintToken(A, now);
    expect(verifyPrintToken(A, token, now + 59_000)).toBe(true);
    expect(verifyPrintToken(A, token, now + 61_000)).toBe(false);
  });
  it("refuses missing, tampered and malformed tokens", () => {
    const [exp, sig] = mintPrintToken(A).split(".");
    expect(verifyPrintToken(A, undefined)).toBe(false);
    expect(verifyPrintToken(A, `${Number(exp) + 600}.${sig}`)).toBe(false);
    expect(verifyPrintToken(A, "garbage")).toBe(false);
  });
});
