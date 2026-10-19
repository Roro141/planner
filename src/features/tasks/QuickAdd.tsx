import { useState } from "react";

type Props = {
  onAdd: (title: string) => void;
};

export function QuickAdd({ onAdd }: Props) {
  const [text, setText] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const title = text.trim();
        if (!title) return;
        onAdd(title);
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
        autoFocus
      />
    </form>
  );
}
