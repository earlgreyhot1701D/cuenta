// Job: check integer-cents parsing, math and formatting.
import { describe, expect, it } from "vitest";
import { formatUSD, lineTotal, parseUSD, sumCents } from "@/lib/money";

describe("money", () => {
  it("formats cents as dollars", () => {
    expect(formatUSD(475)).toBe("$4.75");
    expect(formatUSD(0)).toBe("$0.00");
    expect(formatUSD(123456)).toBe("$1,234.56");
  });
  it("parses dollar input to cents", () => {
    expect(parseUSD("4.75")).toBe(475);
    expect(parseUSD("$4.7")).toBe(470);
    expect(parseUSD("4")).toBe(400);
    expect(parseUSD("1,200.05")).toBe(120005);
  });
  it("rejects bad or negative input", () => {
    expect(parseUSD("-1")).toBeNull();
    expect(parseUSD("abc")).toBeNull();
    expect(parseUSD("4.755")).toBeNull();
  });
  it("totals lines without floating-point drift", () => {
    expect(sumCents([lineTotal(475, 3), lineTotal(375, 7), lineTotal(350, 11)])).toBe(1425 + 2625 + 3850);
  });
});
