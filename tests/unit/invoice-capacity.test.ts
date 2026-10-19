// Job: check the per-page line limit, how lines split across pages, and the spacing that keeps lines above the total rule.
import { describe, expect, it } from "vitest";
import {
  INVOICE_FIRST_LINE_TOP,
  INVOICE_LINE_HEIGHT,
  MAX_LINES_ONE_PAGE,
  linePitch,
  pageLabel,
  paginateLines,
} from "@/lib/invoice-capacity";

const lines = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
const labels = (pages: unknown[][]) => pages.map((_, i) => pageLabel(i + 1, pages.length));

describe("invoice capacity", () => {
  it("keeps Eileen's 36pt spacing for a normal delivery", () => {
    expect(linePitch(4)).toBe(36);
    expect(linePitch(5)).toBe(36);
  });
  it("fits 8 lines on a page", () => {
    expect(MAX_LINES_ONE_PAGE).toBe(8);
  });
  it("keeps a full page's last line above the dotted total rule at 500pt", () => {
    const n = MAX_LINES_ONE_PAGE;
    expect(INVOICE_FIRST_LINE_TOP + (n - 1) * linePitch(n) + INVOICE_LINE_HEIGHT).toBeLessThanOrEqual(500);
  });
});

describe("invoice pages", () => {
  it("keeps 8 lines on one page with no page label", () => {
    const pages = paginateLines(lines(8));
    expect(pages).toEqual([lines(8)]);
    expect(labels(pages)).toEqual([null]);
  });
  it("puts lines 1 to 8 on page 1 and the 9th on page 2", () => {
    const pages = paginateLines(lines(9));
    expect(pages).toEqual([lines(8), [9]]);
    expect(labels(pages)).toEqual(["Page 1 of 2", "Page 2 of 2"]);
  });
  it("splits 16 lines into two full pages", () => {
    const pages = paginateLines(lines(16));
    expect(pages.map((p) => p.length)).toEqual([8, 8]);
    expect(pages[1][0]).toBe(9);
    expect(labels(pages)).toEqual(["Page 1 of 2", "Page 2 of 2"]);
  });
  it("continues onto a third page when needed", () => {
    expect(paginateLines(lines(17)).map((p) => p.length)).toEqual([8, 8, 1]);
  });
  it("always returns at least one page", () => {
    expect(paginateLines([])).toEqual([[]]);
  });
});
