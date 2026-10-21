import type { Task } from "../features/tasks/types";
import { daysFromToday } from "./dates";

/** Monday at midnight of the week `date` is in. Weeks start on Monday. */
export function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const sinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - sinceMonday);
  return start;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** The seven days of the week starting at `weekStart`. */
export function weekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/**
 * Tasks due on each of the seven days, finished ones included (they show
 * crossed out). Sorted like Today: all-day tasks first, then by time.
 */
export function tasksByDay(tasks: Task[], weekStart: Date) {
  const days: Task[][] = Array.from({ length: 7 }, () => []);
  for (const task of tasks) {
    if (!task.dueAt) continue;
    const index = daysFromToday(new Date(task.dueAt), weekStart);
    if (index >= 0 && index < 7) days[index].push(task);
  }
  for (const day of days) {
    day.sort((a, b) => a.dueAt!.localeCompare(b.dueAt!) || a.createdAt.localeCompare(b.createdAt));
  }
  return days;
}

/** Open tasks with no date, oldest first: the tray under the week. */
export function unscheduled(tasks: Task[]) {
  return tasks
    .filter((t) => !t.dueAt && !t.completedAt)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * The changes for moving a task to another day (or to no date, with null).
 * A timed task keeps its time. Moving to a later day counts as a
 * reschedule, for the weekly review; moving earlier or giving an undated
 * task its first date doesn't.
 */
export function moveToDay(task: Task, day: Date | null): Pick<Task, "dueAt" | "hasTime" | "rescheduleCount"> {
  if (day === null) {
    return { dueAt: null, hasTime: false, rescheduleCount: task.rescheduleCount };
  }

  const due = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  if (task.dueAt && task.hasTime) {
    const old = new Date(task.dueAt);
    due.setHours(old.getHours(), old.getMinutes(), 0, 0);
  }

  const later = task.dueAt !== null && daysFromToday(due, new Date(task.dueAt)) > 0;
  return {
    dueAt: due.toISOString(),
    hasTime: task.dueAt !== null && task.hasTime,
    rescheduleCount: task.rescheduleCount + (later ? 1 : 0),
  };
}
