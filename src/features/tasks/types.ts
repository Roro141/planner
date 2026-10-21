import type { Recurrence } from "../../lib/recurrence";

export type Task = {
  id: string;
  title: string;
  /** ISO timestamp, or null when the task has no due date. */
  dueAt: string | null;
  /** False for "tomorrow", true for "tomorrow at 6pm". */
  hasTime: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Soft delete: deleted tasks are kept and hidden, so sync can learn about them later. */
  deletedAt: string | null;
  /** How the task repeats, or null for a one-off task. */
  recurrence: Recurrence | null;
  /** For a repeat: the task whose finishing created this one. */
  repeatOf: string | null;
  /** How many times the due date was moved to a later day, for the weekly review. */
  rescheduleCount: number;
};
