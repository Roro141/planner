import { daysFromToday } from "../../lib/dates";
import type { Task } from "./types";

export type TaskGroups = {
  /** Open tasks due before today. */
  overdue: Task[];
  /** Open tasks due today, then tasks finished today. */
  today: Task[];
  /** Open tasks due after today. */
  upcoming: Task[];
  /** Open tasks with no due date. */
  noDate: Task[];
};

/**
 * Splits tasks into the sections shown on the page. Tasks finished on an
 * earlier day are left out entirely, so the page doesn't fill up with old
 * crossed-out items. They're still in the database.
 */
export function groupTasks(tasks: Task[], now: Date = new Date()): TaskGroups {
  const groups: TaskGroups = { overdue: [], today: [], upcoming: [], noDate: [] };
  const doneToday: Task[] = [];

  for (const task of tasks) {
    if (task.completedAt) {
      if (daysFromToday(new Date(task.completedAt), now) === 0) doneToday.push(task);
      continue;
    }

    if (!task.dueAt) {
      groups.noDate.push(task);
      continue;
    }

    const days = daysFromToday(new Date(task.dueAt), now);
    if (days < 0) groups.overdue.push(task);
    else if (days === 0) groups.today.push(task);
    else groups.upcoming.push(task);
  }

  groups.overdue.sort(byDue);
  groups.today.sort(byDue);
  groups.upcoming.sort(byDue);
  groups.noDate.sort(byCreated);
  doneToday.sort((a, b) => a.completedAt!.localeCompare(b.completedAt!));
  groups.today.push(...doneToday);

  return groups;
}

// ISO strings sort correctly as text. A date-only task is stored at midnight,
// so it comes before timed tasks on the same day.
function byDue(a: Task, b: Task) {
  return a.dueAt!.localeCompare(b.dueAt!) || byCreated(a, b);
}

function byCreated(a: Task, b: Task) {
  return a.createdAt.localeCompare(b.createdAt);
}
