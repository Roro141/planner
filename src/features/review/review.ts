import { daysFromToday } from "../../lib/dates";
import type { FocusSession } from "../focus/sessions";
import type { Task } from "../tasks/types";

export type WeekReview = {
  /** Focus time per day, Monday first, in milliseconds. */
  focusByDay: number[];
  totalFocus: number;
  /** Tasks finished on each day of the week, Monday first. */
  finishedByDay: Task[][];
  finishedCount: number;
  /** Tasks that were due this week, on a day already gone, and are still open. */
  carriedOver: Task[];
  /** Tasks moved to a later day at least twice, still open or finished this week. */
  keptMoving: Task[];
  /** Where focus time went, most first. */
  focusByTask: { task: Task; time: number }[];
};

/** Which day of the week (0 = Monday) a timestamp falls on, or -1 if outside the week. */
function dayIndex(iso: string, weekStart: Date) {
  const index = daysFromToday(new Date(iso), weekStart);
  return index >= 0 && index < 7 ? index : -1;
}

const KEPT_MOVING_AFTER = 2;

/**
 * Everything the review page shows for one week. A look back, not a score:
 * there are counts and times, but no percentages or comparisons.
 */
export function reviewWeek(tasks: Task[], sessions: FocusSession[], weekStart: Date, now: Date): WeekReview {
  const focusByDay = Array<number>(7).fill(0);
  const focusPerTask = new Map<string, number>();

  for (const session of sessions) {
    if (session.kind !== "focus") continue;
    const index = dayIndex(session.endedAt, weekStart);
    if (index === -1) continue;
    const time = Date.parse(session.endedAt) - Date.parse(session.startedAt);
    focusByDay[index] += time;
    if (session.taskId) focusPerTask.set(session.taskId, (focusPerTask.get(session.taskId) ?? 0) + time);
  }

  const finishedByDay: Task[][] = Array.from({ length: 7 }, () => []);
  for (const task of tasks) {
    if (!task.completedAt) continue;
    const index = dayIndex(task.completedAt, weekStart);
    if (index !== -1) finishedByDay[index].push(task);
  }
  for (const day of finishedByDay) day.sort((a, b) => a.completedAt!.localeCompare(b.completedAt!));

  const carriedOver = tasks
    .filter((t) => !t.completedAt && t.dueAt && dayIndex(t.dueAt, weekStart) !== -1)
    .filter((t) => daysFromToday(new Date(t.dueAt!), now) < 0)
    .sort((a, b) => a.dueAt!.localeCompare(b.dueAt!));

  const keptMoving = tasks
    .filter((t) => t.rescheduleCount >= KEPT_MOVING_AFTER)
    .filter((t) => !t.completedAt || dayIndex(t.completedAt, weekStart) !== -1)
    .sort((a, b) => b.rescheduleCount - a.rescheduleCount);

  const byId = new Map(tasks.map((t) => [t.id, t]));
  const focusByTask = [...focusPerTask]
    .flatMap(([id, time]) => {
      const task = byId.get(id);
      return task ? [{ task, time }] : [];
    })
    .sort((a, b) => b.time - a.time);

  return {
    focusByDay,
    totalFocus: focusByDay.reduce((a, b) => a + b, 0),
    finishedByDay,
    finishedCount: finishedByDay.reduce((n, day) => n + day.length, 0),
    carriedOver,
    keptMoving,
    focusByTask,
  };
}
