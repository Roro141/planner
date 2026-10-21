import { describe, expect, it } from "vitest";
import { groupTasks } from "./groupTasks";
import type { Task } from "./types";

// Monday 19 October 2026, 10:00 local time.
const NOW = new Date(2026, 9, 19, 10, 0);

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

function titles(tasks: Task[]) {
  return tasks.map((t) => t.title);
}

describe("groupTasks", () => {
  it("puts each open task in the section for its due day", () => {
    const groups = groupTasks(
      [
        task("last week", { dueAt: local(10, 12) }),
        task("this morning", { dueAt: local(10, 19, 8), hasTime: true }),
        task("tonight", { dueAt: local(10, 19, 20), hasTime: true }),
        task("friday", { dueAt: local(10, 23) }),
        task("someday"),
      ],
      NOW,
    );

    expect(titles(groups.overdue)).toEqual(["last week"]);
    expect(titles(groups.today)).toEqual(["this morning", "tonight"]);
    expect(titles(groups.upcoming)).toEqual(["friday"]);
    expect(titles(groups.noDate)).toEqual(["someday"]);
  });

  it("keeps a task whose time passed earlier today in Today, not Overdue", () => {
    const groups = groupTasks([task("8am", { dueAt: local(10, 19, 8), hasTime: true })], NOW);
    expect(titles(groups.today)).toEqual(["8am"]);
    expect(groups.overdue).toEqual([]);
  });

  it("sorts by due date, with all-day tasks before timed ones on the same day", () => {
    const groups = groupTasks(
      [
        task("fri 3pm", { dueAt: local(10, 23, 15), hasTime: true }),
        task("thu", { dueAt: local(10, 22) }),
        task("fri", { dueAt: local(10, 23) }),
      ],
      NOW,
    );
    expect(titles(groups.upcoming)).toEqual(["thu", "fri", "fri 3pm"]);
  });

  it("sorts tasks without a date by when they were added", () => {
    const groups = groupTasks(
      [task("second", { createdAt: local(10, 2) }), task("first", { createdAt: local(10, 1) })],
      NOW,
    );
    expect(titles(groups.noDate)).toEqual(["first", "second"]);
  });

  it("shows tasks finished today at the end of Today, whatever their due date", () => {
    const groups = groupTasks(
      [
        task("open", { dueAt: local(10, 19) }),
        task("done early", { dueAt: local(10, 30), completedAt: local(10, 19, 9) }),
        task("done undated", { completedAt: local(10, 19, 8) }),
      ],
      NOW,
    );
    expect(titles(groups.today)).toEqual(["open", "done undated", "done early"]);
    expect(groups.upcoming).toEqual([]);
    expect(groups.noDate).toEqual([]);
  });

  it("hides tasks finished on an earlier day", () => {
    const groups = groupTasks([task("old", { completedAt: local(10, 18, 17) })], NOW);
    expect(groups).toEqual({ overdue: [], today: [], upcoming: [], noDate: [] });
  });
});
