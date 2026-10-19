import { QuickAdd } from "./features/tasks/QuickAdd";
import { TaskList } from "./features/tasks/TaskList";
import { useTasks } from "./features/tasks/useTasks";
import "./App.css";
import "./features/tasks/tasks.css";

const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default function App() {
  const { tasks, loading, addTask, renameTask, toggleTask, deleteTask } = useTasks();

  return (
    <main className="page">
      <header className="page-header">
        <p className="page-header__note">today is</p>
        <h1 className="page-header__date">{dateFormat.format(new Date())}</h1>
      </header>

      <QuickAdd onAdd={addTask} />

      {loading ? null : tasks.length === 0 ? (
        <p className="empty-note">a clear page.</p>
      ) : (
        <TaskList
          tasks={tasks}
          onToggle={toggleTask}
          onRename={renameTask}
          onDelete={deleteTask}
        />
      )}
    </main>
  );
}
