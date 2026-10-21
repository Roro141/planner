import { useState } from "react";
import { formatDue } from "../../lib/dates";
import { addDays, startOfWeek, weekDays } from "../../lib/week";
import { useFocusSessions } from "../focus/sessions";
import { formatDuration } from "../focus/timer";
import type { Task } from "../tasks/types";
import { WeekHeader } from "../week/WeekHeader";
import { reviewWeek } from "./review";
import "./review.css";

const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "long" });

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export function ReviewPage({ now, tasks }: { now: Date; tasks: Task[] }) {
  const [offset, setOffset] = useState(0);
  const weekStart = addDays(startOfWeek(now), offset * 7);
  const days = weekDays(weekStart);
  const sessions = useFocusSessions(weekStart.toISOString(), addDays(weekStart, 7).toISOString());

  const note = offset === 0 ? "this week so far" : offset === -1 ? "looking back on last week" : "looking back on";
  const header = <WeekHeader weekStart={weekStart} offset={offset} onOffset={setOffset} note={note} />;
  if (sessions === undefined) return header;

  const review = reviewWeek(tasks, sessions, weekStart, now);
  const longestDay = Math.max(...review.focusByDay, 1);
  const quiet =
    review.totalFocus === 0 &&
    review.finishedCount === 0 &&
    review.carriedOver.length === 0 &&
    review.keptMoving.length === 0;

  return (
    <>
      {header}

      {quiet ? (
        <p className="empty-note">a quiet week.</p>
      ) : (
        <div className="review">
          <section className="review-section" aria-labelledby="review-focus">
            <h2 id="review-focus" className="task-section__title">
              Focus
            </h2>
            <p className="review-lede">
              {review.totalFocus === 0
                ? "No focus sessions this week."
                : `${formatDuration(review.totalFocus)} of focus this week.`}
            </p>
            {review.totalFocus > 0 && (
              <ul className="review-days">
                {days.map((day, i) => (
                  <li key={day.toISOString()} className="review-day">
                    <span className="review-day__name">{weekdayFormat.format(day).toLowerCase()}</span>
                    <span className="review-day__bar" aria-hidden="true">
                      <span style={{ width: `${(review.focusByDay[i] / longestDay) * 100}%` }} />
                    </span>
                    <span className="review-day__time">
                      {review.focusByDay[i] ? formatDuration(review.focusByDay[i]) : "–"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {review.focusByTask.length > 0 && (
              <p className="review-note">
                most of it went to{" "}
                {review.focusByTask.slice(0, 3).map(({ task, time }, i, list) => (
                  <span key={task.id}>
                    <span className="review-em">{task.title}</span> ({formatDuration(time)})
                    {i < list.length - 2 ? ", " : i === list.length - 2 ? " and " : "."}
                  </span>
                ))}
              </p>
            )}
          </section>

          <section className="review-section" aria-labelledby="review-finished">
            <h2 id="review-finished" className="task-section__title">
              Finished
            </h2>
            <p className="review-lede">
              {review.finishedCount === 0
                ? "Nothing crossed off this week."
                : `${plural(review.finishedCount, "thing", "things")} crossed off.`}
            </p>
            <ul className="review-finished">
              {days.map((day, i) =>
                review.finishedByDay[i].length === 0 ? null : (
                  <li key={day.toISOString()}>
                    <span className="review-day__name">{weekdayFormat.format(day).toLowerCase()}</span>
                    <span className="review-finished__titles">
                      {review.finishedByDay[i].map((t) => t.title).join(", ")}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </section>

          {review.carriedOver.length > 0 && (
            <section className="review-section" aria-labelledby="review-carried">
              <h2 id="review-carried" className="task-section__title task-section__title--quiet">
                Carried over
              </h2>
              <ul className="review-list">
                {review.carriedOver.map((task) => (
                  <li key={task.id}>
                    {task.title}
                    <span className="review-list__aside">was due {formatDue(task.dueAt!, false, now)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {review.keptMoving.length > 0 && (
            <section className="review-section" aria-labelledby="review-moving">
              <h2 id="review-moving" className="task-section__title task-section__title--quiet">
                Kept moving
              </h2>
              <ul className="review-list">
                {review.keptMoving.map((task) => (
                  <li key={task.id}>
                    {task.title}
                    <span className="review-list__aside">moved {plural(task.rescheduleCount, "time", "times")}</span>
                  </li>
                ))}
              </ul>
              <p className="review-note">maybe worth breaking down, or letting go.</p>
            </section>
          )}
        </div>
      )}
    </>
  );
}
