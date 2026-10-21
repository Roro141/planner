# PRD: Planner

The plan for where this app is going. [SPEC.md](../SPEC.md) describes what's
built and the current roadmap. This document covers the next big step:
**dump anything in and it ends up in the right place.**

## Sections

1. [Vision and principles](prd/01-vision-and-principles.md)
2. [Data model](prd/02-data-model.md)
3. [Inbox capture](prd/03-inbox-capture.md)
4. [AI organizing](prd/04-ai-organizing.md)
5. [Feeds: Canvas and Google calendars](prd/05-feeds.md)
6. [Calendar](prd/06-calendar.md)
7. [Notes and snippets](prd/07-notes-and-snippets.md)
8. [Backend](prd/08-backend.md)
9. [Search (later)](prd/09-search.md)
10. [Desktop app (later)](prd/10-desktop-app.md)

Features already planned in SPEC.md (recurring tasks, reminders, focus timer,
week planner, weekly review) stay there and aren't repeated here.

## Phases

- **Phase 1: finish SPEC.md.** Navigation, recurring tasks, reminders, focus
  timer, week planner (built as the calendar's week view, section 6), weekly
  review. Goals/projects is dropped.
- **Phase 2: inbox.** Backend, data model, inbox, AI organizing, feeds, rest
  of the calendar.
- **Phase 3: later.** Search, desktop app.

## Glossary

- **Item:** anything the app holds: a task, event, note or snippet.
- **Task:** something to do, maybe with a due date. Shows on Today.
- **Event:** something that happens at a time (a class, an exam). Shows on
  the calendar, not in the task list.
- **Note:** longer text to keep, like lecture notes or a pasted article.
- **Snippet:** a short piece to reuse: a link, a code block, an address.
- **Inbox:** where things are dropped. It's a doorway, not a place where
  things pile up.
- **Feed:** a source the app checks by itself, like the Canvas calendar URL.
- **Source:** where an item came from (typed, dropped file, paste, feed).
- **Course:** a class like "CS 101". Items are grouped by course, created automatically.
- **Drop:** one thing put into the inbox, kept as it was. One drop can become many items.

## Open questions

- Opus 5.5 or the cheaper Haiku 5.5 for sorting? Test both once built. (Section 4)
