// Job: check the invoice number suggestion scheme.
import { describe, expect, it } from "vitest";
import { suggestNumber } from "@/lib/invoice-number";
import { todayPacific } from "@/lib/dates";

describe("suggestNumber", () => {
  it("is the location code followed by MMDDYYYY", () => {
    expect(suggestNumber(1, "2026-10-17")).toBe("110172026");
    expect(suggestNumber(4, "2026-01-05")).toBe("401052026");
  });
  it("uses the Pacific date for a 5:30pm invoice", () => {
    expect(suggestNumber(1, todayPacific(new Date("2026-10-18T00:30:00Z")))).toBe("110172026");
  });
});
