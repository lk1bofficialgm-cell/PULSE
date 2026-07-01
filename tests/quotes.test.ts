import { describe, expect, it } from "vitest";
import { getTodaysQuote, quotes } from "@/lib/quotes";

describe("getTodaysQuote", () => {
  it("is deterministic for the same date", () => {
    const date = new Date("2026-03-15T10:00:00Z");
    expect(getTodaysQuote(date)).toBe(getTodaysQuote(new Date("2026-03-15T23:00:00Z")));
  });

  it("rotates to a different quote on the next calendar day", () => {
    const day1 = new Date("2026-03-15T00:00:00Z");
    const day2 = new Date("2026-03-16T00:00:00Z");
    expect(quotes).toContain(getTodaysQuote(day1));
    expect(getTodaysQuote(day1)).not.toBe(getTodaysQuote(day2));
  });

  it("repeats after exactly one full cycle through the quote list", () => {
    const start = new Date("2026-05-01T00:00:00Z");
    const oneCycleLater = new Date(start);
    oneCycleLater.setUTCDate(oneCycleLater.getUTCDate() + quotes.length);
    expect(getTodaysQuote(oneCycleLater)).toBe(getTodaysQuote(start));
  });
});
