import { useRef } from "react";

// How far the pointer moves before a press counts as a drag, not a click.
const DRAG_THRESHOLD = 4;

type Props = {
  open: boolean;
  onToggle: () => void;
  onDragStart: () => void;
  /** 0–1 while the focus timer runs: drawn as a ring around the bubble. */
  progress?: number | null;
};

/**
 * The round button that floats on the desktop: the planner's rose circle
 * with its check mark. Click to open or close the card; press and move to
 * drag it somewhere else.
 */
export function Bubble({ open, onToggle, onDragStart, progress }: Props) {
  const press = useRef<{ x: number; y: number } | null>(null);
  const ring = 2 * Math.PI * 27;

  return (
    <button
      type="button"
      className={open ? "bubble bubble--open" : "bubble"}
      aria-label={open ? "Close today's tasks" : "Open today's tasks"}
      aria-expanded={open}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        press.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerMove={(event) => {
        if (!press.current) return;
        const moved = Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y);
        if (moved > DRAG_THRESHOLD) {
          press.current = null;
          onDragStart();
        }
      }}
      onPointerUp={() => {
        if (press.current) onToggle();
        press.current = null;
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
    >
      <svg viewBox="0 0 56 56" aria-hidden="true">
        <circle className="bubble__paper" cx="28" cy="28" r="26" />
        {progress != null && (
          <circle
            className="bubble__ring"
            cx="28"
            cy="28"
            r="27"
            strokeDasharray={ring}
            strokeDashoffset={ring * (1 - progress)}
          />
        )}
        <circle className="bubble__dot" cx="28" cy="28" r="15" />
        <path className="bubble__check" d="M21.5 28.5l4.5 4.5 9-10" />
      </svg>
    </button>
  );
}
