import { useCallback, useState } from "react";
import { groupTasks } from "./features/tasks/groupTasks";
import { QuickAdd } from "./features/tasks/QuickAdd";
import { TaskList } from "./features/tasks/TaskList";
import type { Task } from "./features/tasks/types";
import { UndoNote } from "./features/tasks/UndoNote";
import { useTasks } from "./features/tasks/useTasks";
import { useNow } from "./lib/useNow";
import "./App.css";
import "./features/tasks/tasks.css";

const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default function App() {
  const now = useNow();
  const { tasks, loading, addTask, renameTask, toggleTask, deleteTask, restoreTask } = useTasks();
  const [lastDeleted, setLastDeleted] = useState<Task | null>(null);

  // useCallback keeps this the same function between renders. UndoNote's
  // timer effect depends on it, so a new function every render would restart
  // the timer each time the page re-renders.
  const dismissUndo = useCallback(() => setLastDeleted(null), []);

  function handleDelete(id: string) {
    setLastDeleted(tasks.find((task) => task.id === id) ?? null);
    deleteTask(id);
  }

  const groups = groupTasks(tasks, now);
  const handlers = { now, onToggle: toggleTask, onRename: renameTask, onDelete: handleDelete };
  const allDoneToday = groups.today.length > 0 && groups.today.every((task) => task.completedAt);

  return (
    <main className="page">
      <header className="page-header">
        <p className="page-header__note">today is</p>
        <h1 className="page-header__date">{dateFormat.format(now)}</h1>
      </header>

      <QuickAdd onAdd={addTask} />

      {loading ? null : tasks.length === 0 ? (
        <p className="empty-note">a clear page.</p>
      ) : (
        <>
          {groups.overdue.length > 0 && (
            <TaskList title="Overdue" tasks={groups.overdue} className="task-section--quiet" {...handlers} />
          )}
          <TaskList
            title="Today"
            tasks={groups.today}
            empty={<p className="section-note">nothing due today.</p>}
            note={allDoneToday && <p className="section-note">all done for today.</p>}
            {...handlers}
          />
          {groups.upcoming.length > 0 && (
            <TaskList title="Upcoming" tasks={groups.upcoming} {...handlers} />
          )}
          {groups.noDate.length > 0 && (
            <TaskList title="No date" tasks={groups.noDate} {...handlers} />
          )}
        </>
      )}

      {lastDeleted && (
        <UndoNote
          key={lastDeleted.id}
          title={lastDeleted.title}
          onUndo={() => {
            restoreTask(lastDeleted.id);
            setLastDeleted(null);
          }}
          onDismiss={dismissUndo}
        />
      )}
    </main>
  );
}
