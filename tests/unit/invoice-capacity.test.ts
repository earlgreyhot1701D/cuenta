// Job: check the one-page line limit and the spacing that keeps lines above the total rule.
import { describe, expect, it } from "vitest";
import { INVOICE_FIRST_LINE_TOP, INVOICE_LINE_HEIGHT, MAX_LINES_ONE_PAGE, fitsOnePage, linePitch } from "@/lib/invoice-capacity";

describe("invoice capacity", () => {
  it("keeps Eileen's 36pt spacing for a normal delivery", () => {
    expect(linePitch(4)).toBe(36);
    expect(linePitch(5)).toBe(36);
  });
  it("allows 8 lines on one page and refuses the 9th", () => {
    expect(MAX_LINES_ONE_PAGE).toBe(8);
    expect(fitsOnePage(8)).toBe(true);
    expect(fitsOnePage(9)).toBe(false);
  });
  it("keeps the last allowed line above the dotted total rule at 500pt", () => {
    const n = MAX_LINES_ONE_PAGE;
    expect(INVOICE_FIRST_LINE_TOP + (n - 1) * linePitch(n) + INVOICE_LINE_HEIGHT).toBeLessThanOrEqual(500);
  });
});
