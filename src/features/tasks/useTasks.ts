import { useCallback, useEffect, useRef, useState } from "react";
import type { ParsedTask } from "../../lib/parse/parseTask";
import { nextOccurrence } from "../../lib/recurrence";
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

  function newTask(fields: ParsedTask & { repeatOf?: string }): Task {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      title: fields.title,
      dueAt: fields.dueAt,
      hasTime: fields.hasTime,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      recurrence: fields.recurrence ?? null,
      repeatOf: fields.repeatOf ?? null,
      rescheduleCount: 0,
    };
  }

  function addTask(parsed: ParsedTask) {
    return save(newTask(parsed));
  }

  /** The next occurrence a finished repeating task created, if it still exists. */
  function repeatCreatedBy(id: string) {
    return latest.current?.find((t) => t.repeatOf === id && t.deletedAt === null);
  }

  /**
   * Finishing a repeating task creates the next one right away. Un-finishing
   * it takes that next one back again, unless it's already been finished.
   */
  function toggleTask(id: string) {
    const task = latest.current?.find((t) => t.id === id);
    if (!task) return;
    const now = new Date().toISOString();

    if (task.completedAt) {
      const next = repeatCreatedBy(id);
      if (next && !next.completedAt) save({ ...next, deletedAt: now, updatedAt: now });
      return save({ ...task, completedAt: null, updatedAt: now });
    }

    if (task.recurrence && task.dueAt && !repeatCreatedBy(id)) {
      const due = nextOccurrence(task.recurrence, new Date(task.dueAt));
      save(
        newTask({
          title: task.title,
          dueAt: due.toISOString(),
          hasTime: task.hasTime,
          recurrence: task.recurrence,
          repeatOf: task.id,
        }),
      );
    }
    return save({ ...task, completedAt: now, updatedAt: now });
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
    toggleTask,
    deleteTask: (id: string) => updateTask(id, (_task, now) => ({ deletedAt: now })),
    restoreTask: (id: string) => updateTask(id, () => ({ deletedAt: null })),
  };
}

export type Tasks = ReturnType<typeof useTasks>;
