import type { Task } from "./types";

/** A task as stored in the `tasks` table (see supabase/schema.sql). */
export type TaskRow = {
  id: string;
  user_id?: string;
  title: string;
  due_at: string | null;
  has_time: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

// Postgres returns timestamps like "2026-10-19T15:07:28.123+00:00", while
// the app uses "2026-10-19T15:07:28.123Z". The code sorts by comparing these
// strings, so they have to share one format.
function iso(value: string): string;
function iso(value: string | null): string | null;
function iso(value: string | null) {
  return value === null ? null : new Date(value).toISOString();
}

export function fromRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    dueAt: iso(row.due_at),
    hasTime: row.has_time,
    completedAt: iso(row.completed_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    deletedAt: iso(row.deleted_at),
  };
}

/** user_id is left out on purpose: the database fills it in from the session. */
export function toRow(task: Task): TaskRow {
  return {
    id: task.id,
    title: task.title,
    due_at: task.dueAt,
    has_time: task.hasTime,
    completed_at: task.completedAt,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    deleted_at: task.deletedAt,
  };
}
