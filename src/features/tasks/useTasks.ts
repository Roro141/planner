import { useState } from "react";
import type { Task } from "./types";

/**
 * All task state and the ways to change it. Components call these functions
 * and never touch the task array directly, so when storage moves to
 * IndexedDB only this file has to change.
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  function addTask(title: string) {
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      dueAt: null,
      hasTime: false,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    setTasks((prev) => [...prev, task]);
  }

  // Applies a change to one task and stamps updatedAt.
  function updateTask(id: string, change: (task: Task, now: string) => Partial<Task>) {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...change(task, now), updatedAt: now } : task,
      ),
    );
  }

  return {
    tasks: tasks.filter((task) => task.deletedAt === null),
    addTask,
    renameTask: (id: string, title: string) => updateTask(id, () => ({ title })),
    toggleTask: (id: string) =>
      updateTask(id, (task, now) => ({ completedAt: task.completedAt ? null : now })),
    deleteTask: (id: string) => updateTask(id, (_task, now) => ({ deletedAt: now })),
  };
}
