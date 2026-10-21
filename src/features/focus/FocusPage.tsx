import { daysFromToday } from "../../lib/dates";
import type { Task } from "../tasks/types";
import { useFocusTimer, useTicker } from "./FocusTimer";
import { focusTime, useFocusSessions } from "./sessions";
import { FOCUS_PER_LONG_BREAK, formatClock, formatDuration, KIND_LABELS, timeLeft } from "./timer";
import "./focus.css";

/** Tasks worth focusing on first: overdue and today, then the rest. */
function pickableTasks(tasks: Task[], now: Date) {
  const open = tasks.filter((t) => !t.completedAt);
  const soon = (t: Task) => t.dueAt !== null && daysFromToday(new Date(t.dueAt), now) <= 0;
  return [...open.filter(soon), ...open.filter((t) => !soon(t))];
}

function dayRange(now: Date) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return [start.toISOString(), end.toISOString()] as const;
}

export function FocusPage({ now, tasks }: { now: Date; tasks: Task[] }) {
  const timer = useFocusTimer();
  const { state } = timer;
  const tick = useTicker(state.status === "running");
  const left = timeLeft(state, tick);

  // ISO strings, so the sessions only reload when the day changes.
  const [from, to] = dayRange(now);
  const today = useFocusSessions(from, to);
  const todayFocus = today?.filter((s) => s.kind === "focus") ?? [];

  const choices = pickableTasks(tasks, now);
  const attached = tasks.find((t) => t.id === state.taskId);
  const dots = Array.from({ length: FOCUS_PER_LONG_BREAK }, (_, i) => i < state.focusDone);
  const sessionWord = todayFocus.length === 1 ? "session" : "sessions";

  return (
    <section className={`focus focus--${state.kind}`} aria-label="Focus timer">
      <p className="page-header__note">{KIND_LABELS[state.kind]}</p>
      <p className="focus__clock" role="timer">
        {formatClock(left)}
      </p>

      <ol
        className="focus__dots"
        aria-label={`${state.focusDone} of ${FOCUS_PER_LONG_BREAK} focus sessions before a long break`}
      >
        {dots.map((filled, i) => (
          <li key={i} className={filled ? "focus__dot focus__dot--done" : "focus__dot"} />
        ))}
      </ol>

      <div className="focus__controls">
        {state.status === "running" ? (
          <button type="button" className="focus__main" onClick={timer.pause}>
            pause
          </button>
        ) : (
          <button type="button" className="focus__main" onClick={timer.start}>
            {state.status === "paused" ? "resume" : "start"}
          </button>
        )}
        {state.status !== "idle" && (
          <button type="button" className="focus__quiet" onClick={timer.reset}>
            reset
          </button>
        )}
        <button type="button" className="focus__quiet" onClick={timer.skip}>
          skip to {state.kind === "focus" ? "break" : "focus"}
        </button>
      </div>

      <label className="focus__task">
        <span className="focus__task-label">working on</span>
        <select
          className="focus__select"
          value={attached ? attached.id : ""}
          onChange={(event) => timer.setTask(event.target.value || null)}
        >
          <option value="">nothing in particular</option>
          {choices.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </label>

      {timer.saveError && (
        <p className="page-error" role="alert">
          Couldn't save the last session. Check your connection.
        </p>
      )}

      <p className="focus__today">
        {todayFocus.length === 0
          ? "no focus sessions yet today."
          : `${formatDuration(focusTime(todayFocus))} of focus today, in ${todayFocus.length} ${sessionWord}.`}
      </p>
    </section>
  );
}
