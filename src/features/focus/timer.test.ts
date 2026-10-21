import { describe, expect, it } from "vitest";
import {
  DURATIONS,
  finish,
  formatClock,
  formatDuration,
  initialTimer,
  isFinished,
  pause,
  reset,
  skip,
  start,
  timeLeft,
  type TimerState,
} from "./timer";

const T0 = Date.UTC(2026, 9, 19, 9, 0);
const MIN = 60_000;
const id = () => "s1";

describe("focus timer", () => {
  it("counts down from 25 minutes once started", () => {
    const running = start(initialTimer, T0, id);
    expect(timeLeft(running, T0 + 10 * MIN)).toBe(15 * MIN);
    expect(isFinished(running, T0 + 25 * MIN)).toBe(true);
  });

  it("pausing keeps the time left, resuming continues from it", () => {
    const paused = pause(start(initialTimer, T0, id), T0 + 10 * MIN);
    expect(timeLeft(paused, T0 + 60 * MIN)).toBe(15 * MIN);
    const resumed = start(paused, T0 + 60 * MIN, () => "other");
    expect(resumed.sessionId).toBe("s1");
    expect(resumed.endsAt).toBe(T0 + 75 * MIN);
  });

  it("finishing focus saves it with its planned end, then offers a short break", () => {
    const running = { ...start(initialTimer, T0, id), taskId: "t1" };
    const { session, next } = finish(running);
    expect(session).toEqual({
      id: "s1",
      kind: "focus",
      taskId: "t1",
      startedAt: new Date(T0).toISOString(),
      endedAt: new Date(T0 + 25 * MIN).toISOString(),
    });
    expect(next).toMatchObject({ kind: "short_break", status: "idle", focusDone: 1, remaining: DURATIONS.short_break, taskId: "t1" });
  });

  it("doesn't count paused time as focus", () => {
    const paused = pause(start(initialTimer, T0, id), T0 + 10 * MIN);
    const resumed = start(paused, T0 + 40 * MIN, id);
    const { session } = finish(resumed);
    expect(session!.endedAt).toBe(new Date(T0 + 55 * MIN).toISOString());
    expect(Date.parse(session!.endedAt) - Date.parse(session!.startedAt)).toBe(25 * MIN);
  });

  it("gives a long break after the fourth focus, then starts the count again", () => {
    let state: TimerState = { ...initialTimer, focusDone: 3 };
    state = finish(start(state, T0, id)).next;
    expect(state.kind).toBe("long_break");
    state = finish(start(state, T0, id)).next;
    expect(state).toMatchObject({ kind: "focus", focusDone: 0 });
  });

  it("skip and reset don't save anything", () => {
    const running = start(initialTimer, T0, id);
    expect(skip(running)).toMatchObject({ kind: "short_break", sessionId: null });
    expect(reset(running)).toMatchObject({ kind: "focus", status: "idle", remaining: DURATIONS.focus, sessionId: null });
  });

  it("formats times", () => {
    expect(formatClock(25 * MIN)).toBe("25:00");
    expect(formatClock(4 * MIN + 6_500)).toBe("4:07");
    expect(formatDuration(45 * MIN)).toBe("45 min");
    expect(formatDuration(75 * MIN)).toBe("1 h 15 min");
    expect(formatDuration(120 * MIN)).toBe("2 h");
  });
});
