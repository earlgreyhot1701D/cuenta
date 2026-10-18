// Job: turn a duplicate invoice number into the 409 "Already used on [date] for [cafe]" answer.
import { HttpError } from "@/lib/api/with-route";
import { formatShort } from "@/lib/dates";
import { DuplicateNumberError } from "@/lib/queries/invoices";

export function duplicateNumberError(err: unknown): unknown {
  if (!(err instanceof DuplicateNumberError)) return err;
  const usedOn = formatShort(err.existing.invoiceDate);
  return new HttpError(409, `Already used on ${usedOn} for ${err.existing.cafeName}`, {
    usedOn,
    cafeName: err.existing.cafeName,
  });
}
