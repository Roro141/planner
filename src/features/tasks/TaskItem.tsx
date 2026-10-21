import { useState } from "react";
import { daysFromToday, formatDue, formatTime } from "../../lib/dates";
import { describeRecurrence } from "../../lib/recurrence";
import type { Task } from "./types";

// How long a just-ticked task stays in place, so the line can draw through it
// before the task moves to the bottom of the list.
const COMPLETE_DELAY_MS = 450;

// Inside the Today section, "today" goes without saying: show only the time,
// or nothing for an all-day task.
function dueLabel(task: Task, now: Date) {
  if (!task.dueAt) return null;
  if (daysFromToday(new Date(task.dueAt), now) === 0) {
    return task.hasTime ? formatTime(task.dueAt) : null;
  }
  return formatDue(task.dueAt, task.hasTime, now);
}

type Props = {
  task: Task;
  now: Date;
  onToggle: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

export function TaskItem({ task, now, onToggle, onRename, onDelete }: Props) {
  // While editing, the title becomes an input holding a draft. The draft is
  // only saved on Enter or blur; Escape throws it away.
  const [draft, setDraft] = useState<string | null>(null);
  // True between ticking the box and the change being saved.
  const [completing, setCompleting] = useState(false);
  const done = task.completedAt !== null || completing;
  const due = dueLabel(task, now);

  function toggle() {
    if (completing) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (task.completedAt || reducedMotion) {
      onToggle(task.id);
      return;
    }
    setCompleting(true);
    setTimeout(() => {
      onToggle(task.id);
      setCompleting(false);
    }, COMPLETE_DELAY_MS);
  }

  function save() {
    if (draft === null) return;
    const title = draft.trim();
    if (title && title !== task.title) onRename(task.id, title);
    setDraft(null);
  }

  return (
    <li className={["task", done && "task--done", task.recurrence && "task--repeat"].filter(Boolean).join(" ")}>
      <input
        type="checkbox"
        className="task__check"
        checked={done}
        onChange={toggle}
        aria-label={`${done ? "Mark not done" : "Mark done"}: ${task.title}`}
      />

      {draft === null ? (
        <button type="button" className="task__title" onClick={() => setDraft(task.title)}>
          <span className="task__text">{task.title}</span>
        </button>
      ) : (
        <input
          className="task__edit"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={save}
          onKeyDown={(event) => {
            if (event.key === "Enter") save();
            if (event.key === "Escape") setDraft(null);
          }}
          aria-label="Edit task"
          autoFocus
        />
      )}

      {draft === null && (due || task.recurrence) && (
        <span className="task__meta">
          {task.recurrence && (
            <span className="repeat">
              <span aria-hidden="true">↻ </span>
              {describeRecurrence(task.recurrence)}
            </span>
          )}
          {due && <span className="due">{due}</span>}
        </span>
      )}

      <button
        type="button"
        className="task__delete"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete: ${task.title}`}
      >
        delete
      </button>
    </li>
  );
}
