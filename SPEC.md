# Spec

A calm personal planner for one person. Capture tasks in seconds, plan the
week, focus in Pomodoro sessions, work toward bigger goals, and look back on
how the week went, without the app ever making you feel behind.

## Principles

- **Zero setup.** Open it and type. No onboarding, no workspaces, no templates,
  no settings you have to configure before it's useful.
- **Capture is instant.** One line of text, not a form.
- **Today first.** The app opens on today, not on everything ever written down.
- **Overdue is just a section.** Overdue tasks live in their own quiet section.
  No red badges, no counters, no nagging.
- **Reflect, don't score.** The review page shows how the week went. No
  streaks, no completion percentages, no grades.
- **Single user.** No sharing or collaboration.
- **Laptop first, phone for capture.** Planning happens on the laptop. The
  phone is mainly for adding a task quickly; both see the same data.

## Features

### Tasks (built)

- Add, edit, complete and delete tasks
- Natural-language dates in quick add ("finish assignment tomorrow 6pm"),
  with a live preview
- Sections: Overdue, Today, Upcoming, No date
- Stored in Supabase and synced between devices (see below)

### Accounts + sync (built)

- Data lives in Supabase (hosted Postgres), shared by laptop and phone
- Email and password, one account created in the Supabase dashboard; sign in once per device
- Online only: no offline support for now
- Changes made on one device show up on the other without a refresh
- On the phone, the site is added to the home screen and opens like an app

### Reminders

- A notification on the phone (and laptop) when a timed task is due
- Needs the site added to the home screen on iPhone (iOS 16.4+)

### Recurring tasks

- Patterns: daily, weekdays, weekly on chosen days, monthly, every N days
- Typed in quick add: "gym every monday"
- Finishing one creates the next occurrence right away
- Styled differently from one-off tasks so they're recognizable at a glance

### Focus timer (Pomodoro)

- Fixed: 25 min focus, 5 min break, 15 min break after every 4 sessions
- A session can optionally be attached to a task
- Every finished session is saved, for the weekly review

### Week planner

- The current week as 7 days, with each day's tasks
- Move a task to another day by dragging it
- Step to the previous and next week

### Goals / projects

- A goal is a bigger outcome ("finish portfolio") that groups tasks
- Tasks can belong to one goal
- Each goal shows its open and finished tasks

### Weekly review

A look back at one week, read like a page in a journal rather than an
analytics panel:

- Focus time per day
- Tasks finished, and which goals they moved forward
- What carried over or kept getting rescheduled

## Roadmap

1. ~~Design foundations~~
2. ~~Tasks in memory~~
3. ~~Persistence (IndexedDB)~~
4. ~~Natural-language quick add + parser tests~~
5. ~~Overdue / Today / Upcoming sections~~
6. ~~Polish: shortcuts, motion, empty states~~
7. ~~Deploy to Vercel~~
8. ~~Accounts + sync with Supabase, installable on the phone~~
9. Navigation between pages
10. Recurring tasks
11. Reminders (notifications)
12. Focus timer
13. Week planner
14. Goals / projects
15. Weekly review (last, because it needs data from everything above)

Later: offline support, desktop widget.

## Data model

### Task

| Field       | Type            | Notes                          |
|-------------|-----------------|--------------------------------|
| id          | string (UUID)   | generated on the client        |
| title       | string          |                                |
| dueAt       | ISO string/null | date + optional time           |
| hasTime     | boolean         | "tomorrow" vs "tomorrow 6pm"   |
| completedAt | ISO string/null |                                |
| createdAt   | ISO string      |                                |
| updatedAt   | ISO string      |                                |
| deletedAt   | ISO string/null | soft delete, enables undo      |
| recurrence  | object/null     | planned: the repeat pattern    |
| goalId      | string/null     | planned: the goal it belongs to |

### Planned tables

- **Goal:** id, title, createdAt, completedAt, updatedAt, deletedAt
- **FocusSession:** id, taskId (nullable), startedAt, endedAt, kind
  (focus / short break / long break)

Exact fields get decided when each feature is built.
