// Job: check Pacific dates and display formats, including the late-evening case.
import { describe, expect, it } from "vitest";
import { addDays, daysBetween, formatShort, formatStamp, todayPacific } from "@/lib/dates";

describe("todayPacific", () => {
  it("keeps 5:30pm Pacific on today even though UTC has rolled to tomorrow", () => {
    // 2026-10-17 17:30 PDT is 2026-10-18 00:30 UTC.
    expect(todayPacific(new Date("2026-10-18T00:30:00Z"))).toBe("2026-10-17");
  });
  it("rolls over at Pacific midnight", () => {
    expect(todayPacific(new Date("2026-10-18T07:00:00Z"))).toBe("2026-10-18");
  });
  it("handles standard time in winter", () => {
    // 2026-12-01 23:30 PST is 2026-12-02 07:30 UTC.
    expect(todayPacific(new Date("2026-12-02T07:30:00Z"))).toBe("2026-12-01");
  });
});

describe("date math and formats", () => {
  it("adds 30 days across a month boundary", () => {
    expect(addDays("2026-10-17", 30)).toBe("2026-11-16");
  });
  it("counts days between dates across DST", () => {
    expect(daysBetween("2026-10-17", "2026-11-16")).toBe(30);
  });
  it("formats short dates", () => {
    expect(formatShort("2026-10-09")).toBe("Oct 9");
  });
  it("formats stamps in Pacific time", () => {
    expect(formatStamp(new Date("2026-10-18T16:14:00Z"))).toBe("Oct 18 9:14am");
  });
});
