import { describe, expect, it } from "vitest";
import type { Task } from "../features/tasks/types";
import { moveToDay, startOfWeek, tasksByDay, unscheduled } from "./week";

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

describe("startOfWeek", () => {
  it("is the Monday of that week", () => {
    expect(startOfWeek(new Date(2026, 9, 21, 15))).toEqual(new Date(2026, 9, 19));
    // Sunday belongs to the week that started the Monday before.
    expect(startOfWeek(new Date(2026, 9, 25, 23))).toEqual(new Date(2026, 9, 19));
    expect(startOfWeek(new Date(2026, 9, 19, 0))).toEqual(new Date(2026, 9, 19));
  });
});

describe("tasksByDay", () => {
  it("puts tasks on their day of the week, sorted, and leaves out other weeks", () => {
    const week = new Date(2026, 9, 19);
    const days = tasksByDay(
      [
        task("wed evening", { dueAt: local(10, 21, 18), hasTime: true }),
        task("wed", { dueAt: local(10, 21) }),
        task("sun", { dueAt: local(10, 25), completedAt: local(10, 25, 9) }),
        task("next monday", { dueAt: local(10, 26) }),
        task("no date"),
      ],
      week,
    );
    expect(days[2].map((t) => t.title)).toEqual(["wed", "wed evening"]);
    expect(days[6].map((t) => t.title)).toEqual(["sun"]);
    expect(days.flat()).toHaveLength(3);
  });
});

describe("unscheduled", () => {
  it("lists open tasks without a date", () => {
    const list = unscheduled([task("a"), task("b", { completedAt: local(10, 2) }), task("c", { dueAt: local(10, 20) })]);
    expect(list.map((t) => t.title)).toEqual(["a"]);
  });
});

describe("moveToDay", () => {
  it("keeps a timed task's time and counts moving it later", () => {
    const essay = task("essay", { dueAt: local(10, 20, 18), hasTime: true });
    expect(moveToDay(essay, new Date(2026, 9, 22))).toEqual({
      dueAt: local(10, 22, 18),
      hasTime: true,
      rescheduleCount: 1,
    });
  });

  it("doesn't count moving earlier, or giving an undated task a day", () => {
    const essay = task("essay", { dueAt: local(10, 22) });
    expect(moveToDay(essay, new Date(2026, 9, 20)).rescheduleCount).toBe(0);
    expect(moveToDay(task("someday"), new Date(2026, 9, 20))).toEqual({
      dueAt: local(10, 20),
      hasTime: false,
      rescheduleCount: 0,
    });
  });

  it("can take the date away", () => {
    const essay = task("essay", { dueAt: local(10, 22, 9), hasTime: true });
    expect(moveToDay(essay, null)).toEqual({ dueAt: null, hasTime: false, rescheduleCount: 0, recurrence: null });
  });
});
