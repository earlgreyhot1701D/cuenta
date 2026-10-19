// Job: how many lines fit on one page of the Canva invoice, how lines split across pages, and the spacing that fits them.

/** First line's top and the dotted rule above INVOICE TOTAL, in PDF points (from Eileen's form). */
const FIRST_LINE_TOP = 320;
const LAST_LINE_BOTTOM = 494;
const LINE_HEIGHT = 15;
const FORM_PITCH = 36;
const MIN_PITCH = 22;

/** Measured against Letter: 8 lines at the tightest readable spacing still clear the total rule. */
export const MAX_LINES_ONE_PAGE = 1 + Math.floor((LAST_LINE_BOTTOM - FIRST_LINE_TOP - LINE_HEIGHT) / MIN_PITCH);

/** Lines 1–8 on page 1, the rest continuing 8 per page. Always at least one page. */
export function paginateLines<T>(lines: T[]): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < lines.length; i += MAX_LINES_ONE_PAGE) pages.push(lines.slice(i, i + MAX_LINES_ONE_PAGE));
  return pages.length ? pages : [[]];
}

/** "Page 1 of 2" (page is 1-based), or null for a one-page invoice so it matches the paper form. */
export function pageLabel(page: number, total: number): string | null {
  return total > 1 ? `Page ${page} of ${total}` : null;
}

/** Eileen's 36pt spacing for a short invoice, tightened evenly when more lines need the same space. */
export function linePitch(lineCount: number): number {
  if (lineCount <= 1) return FORM_PITCH;
  const fit = (LAST_LINE_BOTTOM - FIRST_LINE_TOP - LINE_HEIGHT) / (lineCount - 1);
  return Math.max(MIN_PITCH, Math.min(FORM_PITCH, fit));
}

export const INVOICE_FIRST_LINE_TOP = FIRST_LINE_TOP;
export const INVOICE_LINE_HEIGHT = LINE_HEIGHT;
