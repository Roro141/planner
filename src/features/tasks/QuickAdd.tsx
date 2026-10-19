import { useEffect, useRef, useState } from "react";
import { formatDue } from "../../lib/dates";
import { parseTask, type ParsedTask } from "../../lib/parse/parseTask";

type Props = {
  onAdd: (task: ParsedTask) => void;
};

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

export function QuickAdd({ onAdd }: Props) {
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
            if (text) setText("");
            else event.currentTarget.blur();
          }
        }}
        placeholder="Add a task — try “finish assignment tomorrow 6pm”"
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
          </>
        )}
      </p>
    </form>
  );
}
