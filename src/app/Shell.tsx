import { useCallback, useState } from "react";
import { FocusPage } from "../features/focus/FocusPage";
import { NavTimer } from "../features/focus/NavTimer";
import { ReminderToggle } from "../features/reminders/ReminderToggle";
import { forgetThisDevice } from "../features/reminders/useReminders";
import { ReviewPage } from "../features/review/ReviewPage";
import { TodayPage } from "../features/tasks/TodayPage";
import type { Task } from "../features/tasks/types";
import { UndoNote } from "../features/tasks/UndoNote";
import { useTasks } from "../features/tasks/useTasks";
import { WeekPage } from "../features/week/WeekPage";
import { usePath } from "../lib/router";
import { supabase } from "../lib/supabase";
import { useNow } from "../lib/useNow";
import { Dashboard } from "./Dashboard";
import { Nav, pageFor, type SectionPath } from "./Nav";
import { Panel } from "./Panel";
import "../features/tasks/tasks.css";
import "./shell.css";

/**
 * Everything around the sections: navigation, the one shared task list, the
 * error line and the undo note. Tasks are loaded here, once, so switching
 * tabs doesn't reload them and every section sees the same copy.
 *
 * The dashboard ("/") shows all four sections at once. Each section's own
 * tab ("/week" and so on) shows just that one, full size.
 */
export function Shell({ userId }: { userId: string }) {
  const page = pageFor(usePath());
  const now = useNow();
  const tasks = useTasks(userId);
  const [lastDeleted, setLastDeleted] = useState<Task | null>(null);

  // useCallback keeps this the same function between renders. UndoNote's
  // timer effect depends on it, so a new function every render would restart
  // the timer each time the page re-renders.
  const dismissUndo = useCallback(() => setLastDeleted(null), []);

  function deleteTask(id: string) {
    setLastDeleted(tasks.tasks.find((task) => task.id === id) ?? null);
    return tasks.deleteTask(id);
  }

  const pageTasks = { ...tasks, deleteTask };
  const dashboard = page === "/";

  function section(path: SectionPath) {
    const expanded = page === path;
    switch (path) {
      case "/today":
        return (
          <Panel key={path} path={path} label="today" expanded={expanded} className="panel--today">
            <TodayPage now={now} tasks={pageTasks} />
          </Panel>
        );
      case "/focus":
        return (
          <Panel key={path} path={path} label="focus" expanded={expanded} className="panel--focus">
            <FocusPage now={now} tasks={tasks.tasks} />
          </Panel>
        );
      case "/week":
        return (
          <Panel key={path} path={path} label="week" expanded={expanded} className="panel--week">
            <WeekPage now={now} tasks={pageTasks} />
          </Panel>
        );
      case "/review":
        return (
          <Panel key={path} path={path} label="review" expanded={expanded} className="panel--review">
            <ReviewPage now={now} tasks={tasks.tasks} />
          </Panel>
        );
    }
  }

  // The dashboard and the week need room; today, focus and review read
  // better at a narrower width on their own.
  const wide = dashboard || page === "/week";

  return (
    <div className={wide ? "page page--wide" : "page"}>
      {/* The small timer in the nav, wherever the focus section isn't showing. */}
      <Nav current={page} extra={page !== "/focus" && !dashboard && <NavTimer />} />

      {tasks.error && (
        <p className="page-error" role="alert">
          {tasks.error}
        </p>
      )}

      <main>
        {dashboard ? (
          <Dashboard
            cards={{
              today: section("/today"),
              focus: section("/focus"),
              review: section("/review"),
              week: section("/week"),
            }}
          />
        ) : (
          section(page)
        )}
      </main>

      <footer className="page-footer">
        <ReminderToggle />
        <button
          type="button"
          className="sign-out"
          onClick={async () => {
            await forgetThisDevice();
            await supabase.auth.signOut();
          }}
        >
          sign out
        </button>
      </footer>

      {lastDeleted && (
        <UndoNote
          key={lastDeleted.id}
          title={lastDeleted.title}
          onUndo={() => {
            tasks.restoreTask(lastDeleted.id);
            setLastDeleted(null);
          }}
          onDismiss={dismissUndo}
        />
      )}
    </div>
  );
}
