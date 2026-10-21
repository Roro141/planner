# Spec

A calm personal planner for one person. Capture tasks in seconds, plan the
week, focus in Pomodoro sessions, and look back on
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

### Dashboard (built)

- One central page with every section as a card: today on the left, focus
  and review on the right, the week across the bottom
- Cards can be moved (drag the ⠿ grip) and resized (drag the bottom-right
  corner); the arrangement is remembered on each device, with a "reset the
  layout" link to go back to the default
- Each card has a corner button that opens it on its own, full size; tabs
  at the top switch between the dashboard and each section
- On the phone the cards stack: today, focus, week, review

### Reminders (built, needs setup)

- A notification on the phone (and laptop) when a timed task is due
- Needs the site added to the home screen on iPhone (iOS 16.4+)
- Turned on per device from the bottom of the page
- One-time setup: [docs/reminders-setup.md](docs/reminders-setup.md)

### Recurring tasks (built)

- Patterns: daily, weekdays, weekly on chosen days, monthly, every N days
- Typed in quick add: "gym every monday"
- Finishing one creates the next occurrence right away
- Styled differently from one-off tasks so they're recognizable at a glance
  (dashed checkbox, "↻ every Monday")
- Un-finishing one takes back the occurrence it created

### Focus timer (Pomodoro) (built)

- Fixed: 25 min focus, 5 min break, 15 min break after every 4 sessions
- A session can optionally be attached to a task
- Every finished session is saved, for the weekly review
- Keeps running while you switch pages, and survives a reload; the time
  left shows in the navigation and the tab title
- A soft chime when a session ends, and a notification if the tab is hidden

### Week planner (built)

Built as the Planner mode of the calendar's week view (see
[docs/prd/06-calendar.md](docs/prd/06-calendar.md)).

- The current week as 7 days, with each day's tasks
- Move a task to another day by dragging it
- Step to the previous and next week
- Add a task straight to a day; a "No date" tray to drag from and to
- Moving a task to a later day is counted, for the weekly review

### Weekly review (built)

A look back at one week, read like a page in a journal rather than an
analytics panel:

- Focus time per day
- Tasks finished
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
9. ~~Navigation between pages~~
10. ~~Recurring tasks~~
11. ~~Reminders (notifications)~~ (code done; needs the setup steps)
12. ~~Focus timer~~
13. ~~Week planner~~
14. ~~Weekly review~~

After that: the inbox, feeds and calendar, see [docs/PRD.md](docs/PRD.md).

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
| recurrence  | object/null     | repeat rule, e.g. weekly on Monday |
| repeatOf    | string/null     | the finished task that created this repeat |
| rescheduleCount | number      | times moved to a later day     |
| remindedAt  | (server only)   | when the reminder was sent     |

### FocusSession

| Field     | Type            | Notes                                  |
|-----------|-----------------|----------------------------------------|
| id        | string (UUID)   | generated when the session starts      |
| taskId    | string/null     | the task it was attached to            |
| kind      | string          | focus / short_break / long_break       |
| startedAt | ISO string      |                                        |
| endedAt   | ISO string      | when it was due to end                 |

### PushSubscription

One per device with reminders on: endpoint and keys from the browser.
