import { useEffect } from "react";

const VISIBLE_MS = 6000;

type Props = {
  title: string;
  onUndo: () => void;
  onDismiss: () => void;
};

/**
 * A small note at the bottom of the page after a delete. It dismisses itself
 * after a few seconds; the parent gives it a new `key` for each delete, so
 * the timer starts over when you delete another task.
 */
export function UndoNote({ title, onUndo, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="undo-note" role="status">
      <span className="undo-note__text">
        Deleted <span className="undo-note__title">{title}</span>
      </span>
      <button type="button" className="undo-note__button" onClick={onUndo}>
        undo
      </button>
    </div>
  );
}
