// Job: the one-page line limit for the Canva invoice, and the line spacing that fits it.

/** First line's top and the dotted rule above INVOICE TOTAL, in PDF points (from Eileen's form). */
const FIRST_LINE_TOP = 320;
const LAST_LINE_BOTTOM = 494;
const LINE_HEIGHT = 15;
const FORM_PITCH = 36;
const MIN_PITCH = 22;

/** Measured against Letter: 8 lines at the tightest readable spacing still clear the total rule. */
export const MAX_LINES_ONE_PAGE = 1 + Math.floor((LAST_LINE_BOTTOM - FIRST_LINE_TOP - LINE_HEIGHT) / MIN_PITCH);

export function fitsOnePage(lineCount: number): boolean {
  return lineCount <= MAX_LINES_ONE_PAGE;
}

/** Eileen's 36pt spacing for a short invoice, tightened evenly when more lines need the same space. */
export function linePitch(lineCount: number): number {
  if (lineCount <= 1) return FORM_PITCH;
  const fit = (LAST_LINE_BOTTOM - FIRST_LINE_TOP - LINE_HEIGHT) / (lineCount - 1);
  return Math.max(MIN_PITCH, Math.min(FORM_PITCH, fit));
}

export const INVOICE_FIRST_LINE_TOP = FIRST_LINE_TOP;
export const INVOICE_LINE_HEIGHT = LINE_HEIGHT;
