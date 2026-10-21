import { describe, expect, it } from "vitest";
import { parseTask } from "./parseTask";

// Monday 19 October 2026, 10:00 local time. Month is 0-based: 9 = October.
const NOW = new Date(2026, 9, 19, 10, 0);

// Builds the expected ISO string from local date parts, so the tests pass in
// any time zone.
function local(month: number, day: number, hour = 0, minute = 0) {
  return new Date(2026, month - 1, day, hour, minute).toISOString();
}

describe("parseTask", () => {
  it("leaves text without a date alone", () => {
    expect(parseTask("buy milk", NOW)).toEqual({ title: "buy milk", dueAt: null, hasTime: false });
  });

  it("does not mistake numbers in the title for dates", () => {
    expect(parseTask("read chapter 5", NOW).dueAt).toBeNull();
    expect(parseTask("watch 3 episodes", NOW).dueAt).toBeNull();
  });

  it("parses a day and a time", () => {
    expect(parseTask("Finish my assignment tomorrow at 6 pm", NOW)).toEqual({
      title: "Finish my assignment",
      dueAt: local(10, 20, 18),
      hasTime: true,
    });
  });

  it("parses compact times", () => {
    expect(parseTask("finish assignment tomorrow 6pm", NOW)).toEqual({
      title: "finish assignment",
      dueAt: local(10, 20, 18),
      hasTime: true,
    });
  });

  it("stores a day with no time as midnight and hasTime false", () => {
    expect(parseTask("dentist friday", NOW)).toEqual({
      title: "dentist",
      dueAt: local(10, 23),
      hasTime: false,
    });
  });

  it("removes connecting words left in front of the date", () => {
    expect(parseTask("submit report by next monday", NOW).title).toBe("submit report");
    expect(parseTask("essay due oct 25", NOW).title).toBe("essay");
    expect(parseTask("call mom at 3", NOW).title).toBe("call mom");
  });

  it("keeps text that comes after the date", () => {
    expect(parseTask("tomorrow call the bank", NOW).title).toBe("call the bank");
  });

  it("trims punctuation left at the edges", () => {
    expect(parseTask("tonight: clean room", NOW).title).toBe("clean room");
  });

  it("treats a bare small hour as afternoon, today if it hasn't passed", () => {
    expect(parseTask("call mom at 3", NOW)).toMatchObject({ dueAt: local(10, 19, 15), hasTime: true });
  });

  it("moves a bare afternoon hour to tomorrow once it has passed", () => {
    const evening = new Date(2026, 9, 19, 16, 0);
    expect(parseTask("call mom at 3", evening).dueAt).toBe(local(10, 20, 15));
  });

  it("respects an explicit am", () => {
    expect(parseTask("gym 7am", NOW).dueAt).toBe(local(10, 20, 7));
  });

  it("does not shift hours that are clearly morning or evening already", () => {
    expect(parseTask("standup at 9", NOW).dueAt).toBe(local(10, 20, 9));
  });

  it("parses relative times", () => {
    expect(parseTask("meeting in 2 hours", NOW).dueAt).toBe(local(10, 19, 12));
  });

  it("keeps the whole text as the title when it is only a date", () => {
    expect(parseTask("tomorrow", NOW)).toEqual({ title: "tomorrow", dueAt: null, hasTime: false });
  });

  it("trims surrounding whitespace", () => {
    expect(parseTask("  buy milk  ", NOW).title).toBe("buy milk");
  });
});

describe("parseTask with repeats", () => {
  it("reads a weekday and a time", () => {
    // Monday 10:00, so 7am today has passed: the first one is next Monday.
    expect(parseTask("gym every monday 7am", NOW)).toEqual({
      title: "gym",
      dueAt: local(10, 26, 7),
      hasTime: true,
      recurrence: { kind: "weekly", days: [1] },
    });
  });

  it("starts today when the day matches and there's no time", () => {
    expect(parseTask("gym every monday", NOW)).toMatchObject({
      title: "gym",
      dueAt: local(10, 19),
      hasTime: false,
    });
  });

  it("reads several weekdays", () => {
    expect(parseTask("piano every tue and thu", NOW)).toMatchObject({
      title: "piano",
      dueAt: local(10, 20),
      recurrence: { kind: "weekly", days: [2, 4] },
    });
  });

  it("reads daily, weekdays, monthly and every N days", () => {
    expect(parseTask("vitamins daily", NOW).recurrence).toEqual({ kind: "daily" });
    expect(parseTask("standup every weekday at 9", NOW)).toMatchObject({
      title: "standup",
      dueAt: local(10, 20, 9),
      recurrence: { kind: "weekdays" },
    });
    expect(parseTask("pay rent every month nov 1", NOW)).toMatchObject({
      title: "pay rent",
      dueAt: local(11, 1),
      recurrence: { kind: "monthly", day: 1 },
    });
    expect(parseTask("budget   monthly", NOW)).toMatchObject({
      title: "budget",
      recurrence: { kind: "monthly", day: 19 },
    });
    expect(parseTask("water plants every 3 days", NOW)).toMatchObject({
      title: "water plants",
      dueAt: local(10, 19),
      recurrence: { kind: "interval", days: 3 },
    });
  });

  it("leaves a lone repeat phrase as plain text", () => {
    expect(parseTask("every monday", NOW).recurrence).toBeUndefined();
  });
});
