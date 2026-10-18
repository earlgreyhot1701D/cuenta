// Job: suggest an invoice number from a cafe's location code and the invoice date.

/** Location code followed by MMDDYYYY: suggestNumber(1, "2026-10-17") → "110172026". */
export function suggestNumber(code: number, ymd: string): string {
  const [y, m, d] = ymd.split("-");
  return `${code}${m}${d}${y}`;
}
