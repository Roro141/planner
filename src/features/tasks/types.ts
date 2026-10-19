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
};
