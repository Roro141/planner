import { describe, expect, it } from "vitest";
import { daysFromToday, formatDue } from "./dates";

// Monday 19 October 2026, 10:00 local time.
const NOW = new Date(2026, 9, 19, 10, 0);

function local(month: number, day: number, hour = 0, minute = 0) {
  return new Date(2026, month - 1, day, hour, minute).toISOString();
}

describe("daysFromToday", () => {
  it("counts calendar days, not 24-hour periods", () => {
    // 23:30 tonight is still today; 00:30 is tomorrow even though it's close.
    expect(daysFromToday(new Date(2026, 9, 19, 23, 30), NOW)).toBe(0);
    expect(daysFromToday(new Date(2026, 9, 20, 0, 30), NOW)).toBe(1);
    expect(daysFromToday(new Date(2026, 9, 18, 23, 0), NOW)).toBe(-1);
  });

  it("is not thrown off by a daylight saving change in between", () => {
    // Most of Europe changes clocks on 25 Oct 2026, the US on 1 Nov.
    expect(daysFromToday(new Date(2026, 10, 2), NOW)).toBe(14);
  });
});

describe("formatDue", () => {
  it("uses words for nearby days", () => {
    expect(formatDue(local(10, 19), false, NOW)).toBe("today");
    expect(formatDue(local(10, 20), false, NOW)).toBe("tomorrow");
    expect(formatDue(local(10, 18), false, NOW)).toBe("yesterday");
  });

  it("uses the weekday for the rest of the coming week", () => {
    expect(formatDue(local(10, 23), false, NOW)).toBe("Friday");
  });

  it("uses a short date further out or further back", () => {
    expect(formatDue(local(10, 26), false, NOW)).toBe("Oct 26");
    expect(formatDue(local(10, 12), false, NOW)).toBe("Oct 12");
  });

  it("adds the time when there is one", () => {
    expect(formatDue(local(10, 20, 18), true, NOW)).toBe("tomorrow, 6:00 PM");
  });
});
