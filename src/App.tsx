import { groupTasks } from "./features/tasks/groupTasks";
import { QuickAdd } from "./features/tasks/QuickAdd";
import { TaskList } from "./features/tasks/TaskList";
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
  const { tasks, loading, addTask, renameTask, toggleTask, deleteTask } = useTasks();
  const groups = groupTasks(tasks, now);
  const handlers = { now, onToggle: toggleTask, onRename: renameTask, onDelete: deleteTask };

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
    </main>
  );
}
