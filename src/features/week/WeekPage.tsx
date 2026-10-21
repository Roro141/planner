import { useState, type DragEvent, type KeyboardEvent } from "react";
import { daysFromToday, formatTime } from "../../lib/dates";
import { parseTask } from "../../lib/parse/parseTask";
import { describeRecurrence } from "../../lib/recurrence";
import { addDays, startOfWeek, tasksByDay, unscheduled, weekDays } from "../../lib/week";
import type { Task } from "../tasks/types";
import type { Tasks } from "../tasks/useTasks";
import { WeekHeader } from "./WeekHeader";
import "./week.css";

const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });

/** Where a dragged task can land: a day of the week, or the "no date" tray. */
type DropTarget = number | "tray";

export function WeekPage({ now, tasks: taskState }: { now: Date; tasks: Tasks }) {
  const { tasks, loading, toggleTask, moveTask, addTask } = taskState;
  // Which week is shown, as weeks away from this one.
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<DropTarget | null>(null);

  const weekStart = addDays(startOfWeek(now), offset * 7);
  const days = weekDays(weekStart);
  const byDay = tasksByDay(tasks, weekStart);
  const tray = unscheduled(tasks);

  function drop(target: DropTarget, event: DragEvent) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain") || dragging;
    setDragging(null);
    setOver(null);
    if (id) moveTask(id, target === "tray" ? null : days[target]);
  }

  // The drop zones: every day column and the tray.
  function zone(target: DropTarget) {
    return {
      onDragOver: (event: DragEvent) => {
        if (!dragging) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (over !== target) setOver(target);
      },
      onDragLeave: (event: DragEvent) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(null);
      },
      onDrop: (event: DragEvent) => drop(target, event),
    };
  }

  const itemProps = {
    now,
    onToggle: toggleTask,
    onDragStart: setDragging,
    onDragEnd: () => {
      setDragging(null);
      setOver(null);
    },
  };

  return (
    <>
      <WeekHeader
        weekStart={weekStart}
        offset={offset}
        onOffset={setOffset}
        note={offset === 0 ? "this week" : "week of"}
      />

      {loading ? null : (
        <>
          <ol className="week-grid">
            {days.map((day, index) => {
              const fromToday = daysFromToday(day, now);
              const classes = [
                "week-day",
                fromToday === 0 && "week-day--today",
                fromToday < 0 && "week-day--past",
                index >= 5 && "week-day--weekend",
                over === index && "week-day--over",
              ];
              return (
                <li key={day.toISOString()} className={classes.filter(Boolean).join(" ")} {...zone(index)}>
                  <h2 className="week-day__title">
                    <span className="week-day__name">{weekdayFormat.format(day)}</span>
                    <span className="week-day__number">{day.getDate()}</span>
                  </h2>
                  {byDay[index].length > 0 && (
                    <ul className="week-list">
                      {byDay[index].map((task) => (
                        <WeekTask
                          key={task.id}
                          task={task}
                          {...itemProps}
                          onMove={(by) => moveTask(task.id, addDays(day, by))}
                        />
                      ))}
                    </ul>
                  )}
                  <DayAdd day={day} onAdd={addTask} />
                </li>
              );
            })}
          </ol>

          <section
            className={over === "tray" ? "week-tray week-tray--over" : "week-tray"}
            aria-labelledby="week-tray-title"
            {...zone("tray")}
          >
            <h2 id="week-tray-title" className="task-section__title">
              No date
            </h2>
            {tray.length === 0 ? (
              <p className="section-note">drag a task here to take its date away.</p>
            ) : (
              <ul className="week-list week-list--tray">
                {tray.map((task) => (
                  <WeekTask key={task.id} task={task} {...itemProps} />
                ))}
              </ul>
            )}
          </section>

          <p className="week-hint">drag tasks between days to plan the week. alt + ← / → moves the focused task.</p>
        </>
      )}
    </>
  );
}

type WeekTaskProps = {
  task: Task;
  now: Date;
  onToggle: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  /** Move by a number of days. Not given for undated tasks. */
  onMove?: (byDays: number) => void;
};

function WeekTask({ task, onToggle, onDragStart, onDragEnd, onMove }: WeekTaskProps) {
  const done = task.completedAt !== null;

  function onKeyDown(event: KeyboardEvent) {
    if (!onMove || !event.altKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      onMove(event.key === "ArrowLeft" ? -1 : 1);
    }
  }

  return (
    <li
      className={["week-task", done && "week-task--done", task.recurrence && "task--repeat"].filter(Boolean).join(" ")}
      draggable={!done}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", task.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
      onKeyDown={onKeyDown}
    >
      <input
        type="checkbox"
        className="task__check"
        checked={done}
        onChange={() => onToggle(task.id)}
        aria-label={`${done ? "Mark not done" : "Mark done"}: ${task.title}`}
      />
      <span className="week-task__body">
        <span className="week-task__title">{task.title}</span>
        {(task.hasTime || task.recurrence) && (
          <span className="week-task__meta">
            {task.hasTime && task.dueAt && formatTime(task.dueAt)}
            {task.hasTime && task.recurrence && " · "}
            {task.recurrence && <span title={describeRecurrence(task.recurrence)}>↻</span>}
          </span>
        )}
      </span>
    </li>
  );
}

/** A small line at the bottom of each day for adding a task to that day. */
function DayAdd({ day, onAdd }: { day: Date; onAdd: Tasks["addTask"] }) {
  const [text, setText] = useState("");

  function submit() {
    if (!text.trim()) return;
    // Dates are read as if it were midnight on this day: "3pm" is 3pm that
    // day, "tomorrow" the day after it, and no date at all means this day.
    const midnight = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const parsed = parseTask(text, midnight);
    onAdd({ ...parsed, dueAt: parsed.dueAt ?? midnight.toISOString() });
    setText("");
  }

  return (
    <input
      className="week-add"
      value={text}
      onChange={(event) => setText(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") submit();
        if (event.key === "Escape") {
          setText("");
          event.currentTarget.blur();
        }
      }}
      placeholder="+ add"
      aria-label={`Add a task on ${day.toDateString()}`}
    />
  );
}
