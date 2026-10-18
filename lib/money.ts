// Job: integer-cents money math and USD formatting; no floating-point money anywhere.

/** "$1,234.50" from integer cents. */
export function formatUSD(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString("en-US");
  return `${sign}$${dollars}.${String(abs % 100).padStart(2, "0")}`;
}

/** Parses "4.75", "$4.75" or "4" into cents; null if it isn't a non-negative amount. */
export function parseUSD(input: string): number | null {
  const match = input
    .trim()
    .replace(/^\$/, "")
    .replace(/,/g, "")
    .match(/^(\d+)(?:\.(\d{0,2}))?$/);
  if (!match) return null;
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

/** Unit price times quantity, in cents. */
export function lineTotal(unitPriceCents: number, quantity: number): number {
  return unitPriceCents * quantity;
}

/** Sums cents. */
export function sumCents(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}
