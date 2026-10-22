import { useEffect, useRef, useState } from "react";
import { formatDue } from "../../lib/dates";
import { parseTask, type ParsedTask } from "../../lib/parse/parseTask";
import { describeRecurrence } from "../../lib/recurrence";

type Props = {
  onAdd: (task: ParsedTask) => void;
  placeholder?: string;
};

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

export function QuickAdd({ onAdd, placeholder }: Props) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" jumps to quick add from anywhere on the page, unless you're already
  // typing somewhere (like editing a task title).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || isTyping(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Parsing on every keystroke is cheap, so the preview is derived from the
  // text during render instead of being stored in its own state.
  const parsed = text.trim() ? parseTask(text) : null;

  return (
    <form
      className="quick-add-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!parsed) return;
        onAdd(parsed);
        setText("");
      }}
    >
      <input
        ref={inputRef}
        className="quick-add"
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            // preventDefault tells outer Esc handlers (the desktop widget
            // closing) that this press was used to clear the text.
            if (text) {
              event.preventDefault();
              setText("");
            } else event.currentTarget.blur();
          }
        }}
        placeholder={placeholder ?? "Add a task — try “essay friday 6pm” or “gym every monday”"}
        aria-label="Add a task"
        aria-describedby="quick-add-preview"
        aria-keyshortcuts="/"
        autoFocus
      />
      <kbd className="quick-add__hint" aria-hidden="true">
        /
      </kbd>
      <p id="quick-add-preview" className="quick-add__preview" aria-live="polite">
        {parsed?.dueAt && (
          <>
            <span className="quick-add__title">{parsed.title}</span>
            <span className="due">{formatDue(parsed.dueAt, parsed.hasTime)}</span>
            {parsed.recurrence && (
              <span className="repeat">↻ {describeRecurrence(parsed.recurrence)}</span>
            )}
          </>
        )}
      </p>
    </form>
  );
}
