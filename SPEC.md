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
- **Laptop first.** Designed for a laptop browser. Phone comes later.

## Features

### Tasks (built)

- Add, edit, complete and delete tasks
- Natural-language dates in quick add ("finish assignment tomorrow 6pm"),
  with a live preview
- Sections: Overdue, Today, Upcoming, No date
- Stored locally in IndexedDB

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
6. Polish: shortcuts, motion, empty states
7. Deploy to Vercel
8. Navigation between pages
9. Recurring tasks
10. Focus timer
11. Week planner
12. Goals / projects
13. Weekly review (last, because it needs data from everything above)

Later: accounts + sync, phone (PWA) + notifications, desktop widget.

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
| updatedAt   | ISO string      | needed for sync later          |
| deletedAt   | ISO string/null | soft delete, needed for sync   |
| recurrence  | object/null     | planned: the repeat pattern    |
| goalId      | string/null     | planned: the goal it belongs to |

### Planned tables

- **Goal:** id, title, createdAt, completedAt, updatedAt, deletedAt
- **FocusSession:** id, taskId (nullable), startedAt, endedAt, kind
  (focus / short break / long break)

Exact fields get decided when each feature is built.
