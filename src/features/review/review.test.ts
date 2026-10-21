import { describe, expect, it } from "vitest";
import type { FocusSession } from "../focus/sessions";
import type { Task } from "../tasks/types";
import { reviewWeek } from "./review";

// Week of Monday 19 October 2026; "now" is Thursday the 22nd at noon.
const WEEK = new Date(2026, 9, 19);
const NOW = new Date(2026, 9, 22, 12);

function local(month: number, day: number, hour = 0, minute = 0) {
  return new Date(2026, month - 1, day, hour, minute).toISOString();
}

function task(title: string, fields: Partial<Task> = {}): Task {
  return {
    id: title,
    title,
    dueAt: null,
    hasTime: false,
    completedAt: null,
    createdAt: local(10, 1),
    updatedAt: local(10, 1),
    deletedAt: null,
    recurrence: null,
    repeatOf: null,
    rescheduleCount: 0,
    ...fields,
  };
}

function focus(day: number, minutes: number, taskId: string | null = null): FocusSession {
  return {
    id: `${day}-${minutes}-${taskId}`,
    kind: "focus",
    taskId,
    startedAt: local(10, day, 9),
    endedAt: local(10, day, 9, minutes),
  };
}

describe("reviewWeek", () => {
  it("adds up focus per day and per task, ignoring breaks", () => {
    const essay = task("essay");
    const review = reviewWeek(
      [essay],
      [
        focus(19, 25, "essay"),
        focus(19, 25),
        focus(21, 25, "essay"),
        { ...focus(21, 5), kind: "short_break" },
        focus(26, 25), // next week
      ],
      WEEK,
      NOW,
    );
    expect(review.focusByDay.map((ms) => ms / 60_000)).toEqual([50, 0, 25, 0, 0, 0, 0]);
    expect(review.totalFocus / 60_000).toBe(75);
    expect(review.focusByTask).toEqual([{ task: essay, time: 50 * 60_000 }]);
  });

  it("lists what was finished each day", () => {
    const review = reviewWeek(
      [
        task("read", { completedAt: local(10, 20, 15) }),
        task("gym", { completedAt: local(10, 20, 8) }),
        task("last week", { completedAt: local(10, 16) }),
      ],
      [],
      WEEK,
      NOW,
    );
    expect(review.finishedByDay[1].map((t) => t.title)).toEqual(["gym", "read"]);
    expect(review.finishedCount).toBe(2);
  });

  it("carries over open tasks due on days already gone", () => {
    const review = reviewWeek(
      [
        task("tuesday", { dueAt: local(10, 20) }),
        task("today", { dueAt: local(10, 22) }),
        task("saturday", { dueAt: local(10, 24) }),
        task("done", { dueAt: local(10, 19), completedAt: local(10, 19) }),
      ],
      [],
      WEEK,
      NOW,
    );
    expect(review.carriedOver.map((t) => t.title)).toEqual(["tuesday"]);
  });

  it("notices tasks that keep getting moved", () => {
    const review = reviewWeek(
      [
        task("moved once", { rescheduleCount: 1 }),
        task("moved a lot", { rescheduleCount: 4 }),
        task("moved twice", { rescheduleCount: 2 }),
        task("finished long ago", { rescheduleCount: 5, completedAt: local(9, 1) }),
      ],
      [],
      WEEK,
      NOW,
    );
    expect(review.keptMoving.map((t) => t.title)).toEqual(["moved a lot", "moved twice"]);
  });
});
