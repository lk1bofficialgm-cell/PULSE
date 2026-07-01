import { describe, expect, it } from "vitest";
import { startOfIsoWeek, isSameIsoWeek } from "@/lib/points";

describe("startOfIsoWeek", () => {
  it("returns the Monday of the week for a mid-week date", () => {
    const wednesday = new Date("2026-07-01T12:00:00Z"); // Wednesday
    const monday = startOfIsoWeek(wednesday);
    expect(monday.toISOString().slice(0, 10)).toBe("2026-06-29");
    expect(monday.getUTCHours()).toBe(0);
  });

  it("treats Sunday as the end of the previous ISO week", () => {
    const sunday = new Date("2026-07-05T23:00:00Z");
    const monday = startOfIsoWeek(sunday);
    expect(monday.toISOString().slice(0, 10)).toBe("2026-06-29");
  });

  it("is idempotent for a date that is already a Monday at midnight", () => {
    const monday = new Date("2026-06-29T00:00:00Z");
    expect(startOfIsoWeek(monday).toISOString().slice(0, 10)).toBe("2026-06-29");
  });
});

describe("isSameIsoWeek", () => {
  it("returns true for two dates in the same ISO week", () => {
    const mon = new Date("2026-06-29T02:00:00Z");
    const sun = new Date("2026-07-05T22:00:00Z");
    expect(isSameIsoWeek(mon, sun)).toBe(true);
  });

  it("returns false across a week boundary", () => {
    const sun = new Date("2026-07-05T23:59:00Z");
    const nextMon = new Date("2026-07-06T00:01:00Z");
    expect(isSameIsoWeek(sun, nextMon)).toBe(false);
  });
});
