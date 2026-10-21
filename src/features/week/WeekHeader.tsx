import { addDays } from "../../lib/week";
import "./week.css";

const rangeFormat = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });

type Props = {
  weekStart: Date;
  /** Weeks away from this one: 0 this week, -1 last week. */
  offset: number;
  onOffset: (offset: number) => void;
  /** The handwritten note above the dates, e.g. "this week". */
  note: string;
};

/** "Oct 19 – Oct 25" with arrows to step between weeks. Used by Week and Review. */
export function WeekHeader({ weekStart, offset, onOffset, note }: Props) {
  return (
    <header className="page-header week-header">
      <div>
        <p className="page-header__note">{note}</p>
        <h1 className="page-header__date">
          {rangeFormat.format(weekStart)} – {rangeFormat.format(addDays(weekStart, 6))}
        </h1>
      </div>
      <div className="week-header__nav">
        <button type="button" className="week-step" onClick={() => onOffset(offset - 1)} aria-label="Previous week">
          ←
        </button>
        {offset !== 0 && (
          <button type="button" className="week-step week-step--text" onClick={() => onOffset(0)}>
            this week
          </button>
        )}
        <button type="button" className="week-step" onClick={() => onOffset(offset + 1)} aria-label="Next week">
          →
        </button>
      </div>
    </header>
  );
}
