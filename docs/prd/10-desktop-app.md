# 10. Desktop app (later)

**Built first: the desktop widget** ([docs/desktop-widget.md](../desktop-widget.md)),
a bubble in the corner of the screen that opens a card with today's tasks,
quick add and a mini focus timer. It's the start of this app; the clipboard
shortcut below comes later and can be added to the same Tauri app.

The same app on the Windows laptop as a real program, built with Tauri, so
it can do one thing a browser tab can't: grab the clipboard from anywhere.

## Dump the clipboard

- A **keyboard shortcut** that works in any program: **Ctrl+Alt+D**
  (changeable in settings).
- Pressing it sends whatever is on the clipboard right now to the inbox:
  text, a link, a screenshot, or files copied in File Explorer.
- A small note appears in the corner for a moment: *sent to inbox*. The
  app doesn't open or take focus.
- From there it's a normal drop: Claude sorts it (section 4) and it shows
  in the recent drops list.

Nothing is recorded unless I press the shortcut. There's no clipboard
history.

## The app itself

- The same pages as the website (Today, Calendar, Notes, Inbox), in its own
  window. One codebase: Tauri wraps the existing web app.
- An icon in the system tray with **Dump clipboard**, **Open planner**
  and **Quit**.
- Option to start with Windows, so the shortcut always works.
- Signs in like the website does, once.

## Not doing

- Clipboard history or recording everything copied: too much, and it
  would catch passwords.
- A Mac version (possible later from the same code).
- Saving drops while offline to send later.
