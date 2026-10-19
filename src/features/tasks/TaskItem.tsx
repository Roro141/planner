import { useState } from "react";
import type { Task } from "./types";

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

export function TaskItem({ task, onToggle, onRename, onDelete }: Props) {
  // While editing, the title becomes an input holding a draft. The draft is
  // only saved on Enter or blur; Escape throws it away.
  const [draft, setDraft] = useState<string | null>(null);
  const done = task.completedAt !== null;

  function save() {
    if (draft === null) return;
    const title = draft.trim();
    if (title && title !== task.title) onRename(task.id, title);
    setDraft(null);
  }

  return (
    <li className={done ? "task task--done" : "task"}>
      <input
        type="checkbox"
        className="task__check"
        checked={done}
        onChange={() => onToggle(task.id)}
        aria-label={`${done ? "Mark not done" : "Mark done"}: ${task.title}`}
      />

      {draft === null ? (
        <button type="button" className="task__title" onClick={() => setDraft(task.title)}>
          {task.title}
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
