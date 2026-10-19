import { TaskItem } from "./TaskItem";
import type { Task } from "./types";

type Props = {
  tasks: Task[];
  onToggle: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

// Open tasks first, in the order they were added; finished ones sink to the
// bottom in the order they were finished. ISO strings sort correctly as text.
function sortForDisplay(tasks: Task[]) {
  const open = tasks.filter((task) => !task.completedAt);
  const done = tasks
    .filter((task) => task.completedAt)
    .sort((a, b) => a.completedAt!.localeCompare(b.completedAt!));
  return [...open, ...done];
}

export function TaskList({ tasks, onToggle, onRename, onDelete }: Props) {
  return (
    <ul className="task-list">
      {sortForDisplay(tasks).map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
