import { groupTasks } from "./groupTasks";
import { QuickAdd } from "./QuickAdd";
import { TaskList } from "./TaskList";
import type { Tasks } from "./useTasks";

const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function TodayPage({ now, tasks: taskState }: { now: Date; tasks: Tasks }) {
  const { tasks, loading, addTask, renameTask, toggleTask, deleteTask } = taskState;

  const groups = groupTasks(tasks, now);
  const handlers = { now, onToggle: toggleTask, onRename: renameTask, onDelete: deleteTask };
  const allDoneToday = groups.today.length > 0 && groups.today.every((task) => task.completedAt);

  return (
    <>
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
    </>
  );
}
