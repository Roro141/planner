# 9. Search (later)

Find anything in the app from anywhere.

## Ctrl+K

- **Ctrl+K** (⌘K on Mac) opens a search box over whatever page I'm on.
  On the phone, a search button in the navigation does the same.
- Typing searches tasks, events, notes, snippets, and the text of past
  drops, all at once.
- Results are grouped by kind (Tasks, Events, Notes, Snippets), each row
  showing its course, date and type.
- Arrow keys move, Enter opens the item, Esc closes.
- With nothing typed, it shows the last few things I opened.
- Finished and past items are included, listed after current ones.

The `/` shortcut still jumps to quick add on Today.

## How it finds things

Plain word matching in the database (Postgres full-text search), which also
handles partial words and small typos. Fast, free, and no AI involved.

## Later

- Asking questions in plain words ("when is my next CS exam?").
- Searching inside dropped PDFs.
