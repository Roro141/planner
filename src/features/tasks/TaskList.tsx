import type { ReactNode } from "react";
import { TaskItem } from "./TaskItem";
import type { Task } from "./types";

type Props = {
  title: string;
  tasks: Task[];
  now: Date;
  onToggle: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  /** Shown instead of the list when there are no tasks. */
  empty?: ReactNode;
  className?: string;
};

/** One titled section of the page. Tasks arrive already sorted by groupTasks. */
export function TaskList({ title, tasks, now, onToggle, onRename, onDelete, empty, className }: Props) {
  const id = `section-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section className={className ? `task-section ${className}` : "task-section"} aria-labelledby={id}>
      <h2 id={id} className="task-section__title">
        {title}
      </h2>
      {tasks.length === 0 ? (
        empty
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              now={now}
              onToggle={onToggle}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
