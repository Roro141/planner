import { useCallback, useEffect, useState, type ReactNode } from "react";
import { SignIn } from "../features/auth/SignIn";
import { useSession } from "../features/auth/useSession";
import { FocusTimerProvider, useFocusTimer, useTicker } from "../features/focus/FocusTimer";
import { DURATIONS, formatClock, KIND_LABELS, timeLeft } from "../features/focus/timer";
import { groupTasks } from "../features/tasks/groupTasks";
import { QuickAdd } from "../features/tasks/QuickAdd";
import { TaskList } from "../features/tasks/TaskList";
import type { Task } from "../features/tasks/types";
import { UndoNote } from "../features/tasks/UndoNote";
import { useTasks, type Tasks } from "../features/tasks/useTasks";
import { supabase } from "../lib/supabase";
import { useNow } from "../lib/useNow";
import { Bubble } from "./Bubble";
import { quit, setStartsWithWindows, startsWithWindows } from "./desktop";
import { useWidgetWindow } from "./useWidgetWindow";

type WidgetWindow = ReturnType<typeof useWidgetWindow>;

/** The desktop widget: a bubble that opens into a small card with today's tasks. */
export function Widget() {
  const session = useSession();
  const win = useWidgetWindow();

  // Still checking for a saved sign-in: just the bubble.
  if (session === undefined) return <Frame win={win} />;

  if (session === null) {
    return (
      <Frame win={win}>
        <div className="widget-signin">
          <SignIn />
        </div>
      </Frame>
    );
  }

  return (
    <FocusTimerProvider key={session.user.id} userId={session.user.id}>
      <SignedIn win={win} userId={session.user.id} />
    </FocusTimerProvider>
  );
}

function SignedIn({ win, userId }: { win: WidgetWindow; userId: string }) {
  // Tasks stay loaded (and live-synced) while the card is closed, so it
  // opens instantly with the latest list.
  const tasks = useTasks(userId);
  const { state } = useFocusTimer();
  const tick = useTicker(state.status === "running");
  const progress = state.status === "idle" ? null : 1 - timeLeft(state, tick) / DURATIONS[state.kind];

  return (
    <Frame win={win} progress={progress}>
      <TodayCard tasks={tasks} />
    </Frame>
  );
}

/** Lays out the bubble and, when open, the card on the side that has room. */
export function Frame({ win, progress = null, children }: { win: WidgetWindow; progress?: number | null; children?: ReactNode }) {
  const classes = [
    "widget",
    win.open && "widget--open",
    win.direction.up ? "widget--up" : "widget--down",
    win.direction.left ? "widget--left" : "widget--right",
    !win.desktop && "widget--preview",
  ];
  return (
    <div className={classes.filter(Boolean).join(" ")}>
      {win.open && children && <div className="widget-card">{children}</div>}
      <Bubble open={win.open} onToggle={win.toggle} onDragStart={win.startDrag} progress={progress} />
    </div>
  );
}

const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" });

export function TodayCard({ tasks: taskState }: { tasks: Tasks }) {
  const now = useNow();
  const { tasks, loading, error, addTask, renameTask, toggleTask, deleteTask, restoreTask } = taskState;
  const [lastDeleted, setLastDeleted] = useState<Task | null>(null);
  const dismissUndo = useCallback(() => setLastDeleted(null), []);

  const groups = groupTasks(tasks, now);
  const handlers = {
    now,
    onToggle: toggleTask,
    onRename: renameTask,
    onDelete: (id: string) => {
      setLastDeleted(tasks.find((t) => t.id === id) ?? null);
      deleteTask(id);
    },
  };
  const allDone = groups.today.length > 0 && groups.today.every((t) => t.completedAt);
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  return (
    <>
      <header className="widget-card__header">
        <p className="widget-card__note">today</p>
        <h1 className="widget-card__date">{dateFormat.format(now)}</h1>
      </header>

      {/* This is a list for today: a task typed without a date is for today. */}
      <QuickAdd
        placeholder="add a task for today…"
        onAdd={(parsed) => addTask({ ...parsed, dueAt: parsed.dueAt ?? midnight })}
      />

      {error && (
        <p className="page-error" role="alert">
          {error}
        </p>
      )}

      <div className="widget-card__lists">
        {loading ? null : (
          <>
            {groups.overdue.length > 0 && (
              <TaskList title="Overdue" tasks={groups.overdue} className="task-section--quiet" {...handlers} />
            )}
            <TaskList
              title="Today"
              tasks={groups.today}
              empty={<p className="section-note">nothing due today.</p>}
              note={allDone && <p className="section-note">all done for today.</p>}
              {...handlers}
            />
          </>
        )}
      </div>

      <MiniTimer />
      <CardFooter />

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
    </>
  );
}

/** One line of focus timer: what it is, the time, start/pause. */
function MiniTimer() {
  const timer = useFocusTimer();
  const { state } = timer;
  const tick = useTicker(state.status === "running");

  return (
    <div className={`mini-timer mini-timer--${state.kind}`}>
      <span className="mini-timer__kind">{KIND_LABELS[state.kind]}</span>
      <span className="mini-timer__clock" role="timer">
        {formatClock(timeLeft(state, tick))}
      </span>
      <span className="mini-timer__actions">
        {state.status === "running" ? (
          <button type="button" className="mini-timer__main" onClick={timer.pause}>
            pause
          </button>
        ) : (
          <button type="button" className="mini-timer__main" onClick={timer.start}>
            {state.status === "paused" ? "resume" : "start"}
          </button>
        )}
        {state.status !== "idle" && (
          <button type="button" className="mini-timer__quiet" onClick={timer.reset} aria-label="Reset timer">
            ↺
          </button>
        )}
      </span>
    </div>
  );
}

function CardFooter() {
  const [autostart, setAutostart] = useState<boolean | null>(null);

  useEffect(() => {
    startsWithWindows().then(setAutostart);
  }, []);

  return (
    <footer className="widget-card__footer">
      {autostart !== null && (
        <label className="widget-card__option">
          <input
            type="checkbox"
            checked={autostart}
            onChange={async (event) => {
              const on = event.target.checked;
              setAutostart(on);
              await setStartsWithWindows(on).catch(() => setAutostart(!on));
            }}
          />
          start with Windows
        </label>
      )}
      <span className="widget-card__links">
        <button type="button" className="footer-link" onClick={() => supabase.auth.signOut()}>
          sign out
        </button>
        <button type="button" className="footer-link" onClick={quit}>
          quit
        </button>
      </span>
    </footer>
  );
}
