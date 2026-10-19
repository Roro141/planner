import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import type { ParsedTask } from "../../lib/parse/parseTask";
import type { Task } from "./types";

/**
 * All task state and the ways to change it. The database is the source of
 * truth: the functions below only write to it, and useLiveQuery re-runs the
 * read whenever the tasks table changes, which re-renders the components.
 */
export function useTasks() {
  // undefined until the first read finishes.
  const tasks = useLiveQuery(() => db.tasks.filter((task) => task.deletedAt === null).toArray());

  function addTask({ title, dueAt, hasTime }: ParsedTask) {
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      dueAt,
      hasTime,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    return db.tasks.add(task);
  }

  // Applies a change to one task and stamps updatedAt.
  function updateTask(id: string, change: (task: Task, now: string) => Partial<Task>) {
    const now = new Date().toISOString();
    return db.tasks
      .where("id")
      .equals(id)
      .modify((task) => {
        Object.assign(task, change(task, now), { updatedAt: now });
      });
  }

  return {
    tasks: tasks ?? [],
    loading: tasks === undefined,
    addTask,
    renameTask: (id: string, title: string) => updateTask(id, () => ({ title })),
    toggleTask: (id: string) =>
      updateTask(id, (task, now) => ({ completedAt: task.completedAt ? null : now })),
    deleteTask: (id: string) => updateTask(id, (_task, now) => ({ deletedAt: now })),
  };
}
