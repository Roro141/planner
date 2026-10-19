# Spec

A calm personal planner for one person. Capture a task in seconds by typing it
the way you'd say it, see what matters today, and never feel behind.

## Principles

- **Zero setup.** Open it and type. No onboarding, no workspaces, no templates,
  no settings you have to configure before it's useful.
- **Capture is instant.** One line of text, not a form.
- **Today first.** The main screen is today, not everything ever written down.
- **Overdue is just a section.** Overdue tasks live in their own quiet section.
  No red badges, no counters, no nagging.
- **Single user.** No sharing or collaboration.
- **Laptop first.** Designed for a laptop browser. Phone comes later.

## v1 scope

- Add, edit, complete and delete tasks
- Optional due date and time
- Quick add with natural-language dates ("finish assignment tomorrow 6pm"),
  with a live preview of what was understood
- Views: Overdue, Today, Upcoming
- Data stored locally in the browser (IndexedDB), survives refresh
- Keyboard-friendly

### Not in v1

Accounts, sync, phone, notifications, desktop widget, recurring tasks,
focus timer, projects/lists.

## Build order

1. Design foundations: tokens, layout, background
2. Tasks in memory (React state)
3. Persistence (IndexedDB)
4. Natural-language quick add + parser tests
5. Overdue / Today / Upcoming views
6. Polish: empty states, shortcuts, motion, handwritten details

## After v1 (order can change)

Recurring tasks → focus timer → accounts + sync → phone (PWA) + notifications
→ desktop widget.

## Task data model

| Field       | Type             | Notes                          |
|-------------|------------------|--------------------------------|
| id          | string (UUID)    | generated on the client        |
| title       | string           |                                |
| dueAt       | ISO string/null  | date + optional time           |
| hasTime     | boolean          | "tomorrow" vs "tomorrow 6pm"   |
| completedAt | ISO string/null  |                                |
| createdAt   | ISO string       |                                |
| updatedAt   | ISO string       | needed for sync later          |
| deletedAt   | ISO string/null  | soft delete, needed for sync   |
