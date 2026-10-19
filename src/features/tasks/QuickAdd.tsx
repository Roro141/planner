import { useState } from "react";
import { formatDue } from "../../lib/dates";
import { parseTask, type ParsedTask } from "../../lib/parse/parseTask";

type Props = {
  onAdd: (task: ParsedTask) => void;
};

export function QuickAdd({ onAdd }: Props) {
  const [text, setText] = useState("");

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
        className="quick-add"
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setText("");
        }}
        placeholder="Add a task — try “finish assignment tomorrow 6pm”"
        aria-label="Add a task"
        aria-describedby="quick-add-preview"
        autoFocus
      />
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
