import { describe, expect, it } from "vitest";
import { describeRecurrence, firstOccurrence, nextOccurrence } from "./recurrence";

// Monday 19 October 2026, 10:00 local time. Month is 0-based: 9 = October.
const NOW = new Date(2026, 9, 19, 10, 0);

function day(month: number, date: number, hour = 0) {
  return new Date(2026, month - 1, date, hour);
}

describe("nextOccurrence", () => {
  it("daily: finishing today's gives tomorrow, keeping the time", () => {
    expect(nextOccurrence({ kind: "daily" }, day(10, 19, 7), NOW)).toEqual(day(10, 20, 7));
  });

  it("daily: finishing a week-old one gives tomorrow, not a past day", () => {
    expect(nextOccurrence({ kind: "daily" }, day(10, 12), NOW)).toEqual(day(10, 20));
  });

  it("daily: finishing tomorrow's early gives the day after", () => {
    expect(nextOccurrence({ kind: "daily" }, day(10, 20), NOW)).toEqual(day(10, 21));
  });

  it("weekdays skip the weekend", () => {
    const friday = new Date(2026, 9, 23, 10);
    expect(nextOccurrence({ kind: "weekdays" }, day(10, 23), friday)).toEqual(day(10, 26));
  });

  it("weekly on several days goes to the next chosen day", () => {
    // Monday and Thursday.
    expect(nextOccurrence({ kind: "weekly", days: [1, 4] }, day(10, 19), NOW)).toEqual(day(10, 22));
    expect(nextOccurrence({ kind: "weekly", days: [1, 4] }, day(10, 22), day(10, 22, 9))).toEqual(
      day(10, 26),
    );
  });

  it("monthly keeps its day, using the last day in short months", () => {
    const rule = { kind: "monthly", day: 31 } as const;
    expect(nextOccurrence(rule, day(10, 31), day(10, 31, 9))).toEqual(day(11, 30));
    expect(nextOccurrence(rule, day(11, 30), day(11, 30, 9))).toEqual(day(12, 31));
  });

  it("every N days counts from the due date", () => {
    expect(nextOccurrence({ kind: "interval", days: 3 }, day(10, 19), NOW)).toEqual(day(10, 22));
  });
});

describe("firstOccurrence", () => {
  it("finds the first chosen weekday on or after the start", () => {
    expect(firstOccurrence({ kind: "weekly", days: [5] }, day(10, 19))).toEqual(day(10, 23));
    expect(firstOccurrence({ kind: "weekly", days: [1] }, day(10, 19))).toEqual(day(10, 19));
  });
});

describe("describeRecurrence", () => {
  it("reads naturally", () => {
    expect(describeRecurrence({ kind: "daily" })).toBe("every day");
    expect(describeRecurrence({ kind: "weekly", days: [1] })).toBe("every Monday");
    expect(describeRecurrence({ kind: "weekly", days: [4, 1] })).toBe("every Mon & Thu");
    expect(describeRecurrence({ kind: "weekly", days: [0, 1] })).toBe("every Mon & Sun");
    expect(describeRecurrence({ kind: "interval", days: 2 })).toBe("every other day");
  });
});
