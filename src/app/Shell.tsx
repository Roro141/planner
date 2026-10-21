import { useCallback, useState } from "react";
import { FocusPage } from "../features/focus/FocusPage";
import { ReviewPage } from "../features/review/ReviewPage";
import { NavTimer } from "../features/focus/NavTimer";
import { TodayPage } from "../features/tasks/TodayPage";
import type { Task } from "../features/tasks/types";
import { UndoNote } from "../features/tasks/UndoNote";
import { WeekPage } from "../features/week/WeekPage";
import { useTasks } from "../features/tasks/useTasks";
import { supabase } from "../lib/supabase";
import { usePath } from "../lib/router";
import { useNow } from "../lib/useNow";
import { Nav, pageFor } from "./Nav";
import "../features/tasks/tasks.css";
import "./shell.css";

/**
 * Everything around the pages: navigation, the one shared task list, the
 * error line and the undo note. Tasks are loaded here, once, so switching
 * pages doesn't reload them and every page sees the same copy.
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
  const wide = page === "/week";

  return (
    <div className={wide ? "page page--wide" : "page"}>
      <Nav current={page} extra={page !== "/focus" && <NavTimer />} />

      {tasks.error && (
        <p className="page-error" role="alert">
          {tasks.error}
        </p>
      )}

      <main>
        {page === "/" && <TodayPage now={now} tasks={pageTasks} />}
        {page === "/week" && <WeekPage now={now} tasks={pageTasks} />}
        {page === "/focus" && <FocusPage now={now} tasks={tasks.tasks} />}
        {page === "/review" && <ReviewPage now={now} tasks={tasks.tasks} />}
      </main>

      <footer className="page-footer">
        <button type="button" className="sign-out" onClick={() => supabase.auth.signOut()}>
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
