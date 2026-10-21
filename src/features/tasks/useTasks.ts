import { useCallback, useEffect, useRef, useState } from "react";
import type { ParsedTask } from "../../lib/parse/parseTask";
import { supabase } from "../../lib/supabase";
import { fromRow, toRow, type TaskRow } from "./taskRows";
import type { Task } from "./types";

/**
 * Puts `task` into the list, replacing an older copy with the same id. A
 * copy that is older than the one we already have is ignored: that happens
 * when the realtime echo of an earlier save arrives after a newer local edit.
 */
function merge(tasks: Task[], task: Task) {
  const index = tasks.findIndex((t) => t.id === task.id);
  if (index === -1) return [...tasks, task];
  if (tasks[index].updatedAt > task.updatedAt) return tasks;
  return tasks.map((t, i) => (i === index ? task : t));
}

/**
 * All task state and the ways to change it, backed by Supabase.
 *
 * Changes are optimistic: the screen updates immediately and the save
 * happens in the background, so the app doesn't wait on the network for
 * every tick. Realtime brings in changes made on your other devices.
 */
export function useTasks(userId: string) {
  // undefined until the first load finishes. Includes soft-deleted tasks
  // touched this session, so undo can bring them back.
  const [tasks, setTasks] = useState<Task[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // The latest tasks, for functions that run later (like the delayed
  // complete in TaskItem) and would otherwise see an old render's copy.
  const latest = useRef(tasks);
  latest.current = tasks;

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("tasks").select().is("deleted_at", null);
    if (error) {
      setError("Couldn't load your tasks. Check your connection.");
      return;
    }
    setError(null);
    setTasks((data as TaskRow[]).map(fromRow));
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel(`tasks:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === "DELETE") return;
          const task = fromRow(payload.new as TaskRow);
          setTasks((prev) => (prev ? merge(prev, task) : prev));
        },
      )
      .subscribe();

    // Phones pause background tabs and drop the realtime connection, so
    // reload whenever the app comes back to the screen.
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, load]);

  async function save(task: Task) {
    setTasks((prev) => merge(prev ?? [], task));
    const { error } = await supabase.from("tasks").upsert(toRow(task));
    if (error) {
      setError("Couldn't save that change. Check your connection.");
      load(); // Put the screen back in line with what's actually stored.
    }
  }

  function addTask({ title, dueAt, hasTime }: ParsedTask) {
    const now = new Date().toISOString();
    return save({
      id: crypto.randomUUID(),
      title,
      dueAt,
      hasTime,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  // Applies a change to one task and stamps updatedAt.
  function updateTask(id: string, change: (task: Task, now: string) => Partial<Task>) {
    const task = latest.current?.find((t) => t.id === id);
    if (!task) return;
    const now = new Date().toISOString();
    return save({ ...task, ...change(task, now), updatedAt: now });
  }

  return {
    tasks: (tasks ?? []).filter((task) => task.deletedAt === null),
    loading: tasks === undefined,
    error,
    addTask,
    renameTask: (id: string, title: string) => updateTask(id, () => ({ title })),
    toggleTask: (id: string) =>
      updateTask(id, (task, now) => ({ completedAt: task.completedAt ? null : now })),
    deleteTask: (id: string) => updateTask(id, (_task, now) => ({ deletedAt: now })),
    restoreTask: (id: string) => updateTask(id, () => ({ deletedAt: null })),
  };
}

export type Tasks = ReturnType<typeof useTasks>;
