# Decisions

Why things are the way they are. Newest at the bottom.

## 2026-10-19 — Web app, laptop first

Most planning happens on the laptop. A web app runs there with no install and
can later become an installable PWA on the phone and a Tauri desktop app,
all from one codebase.

## 2026-10-19 — TypeScript + React + Vite

Comfortable with React/TS already. Vite keeps config minimal.

## 2026-10-19 — Plain CSS with design tokens, no component library

The visual direction is specific (warm, paper-like, personal). Component
libraries pull toward a generic look and have to be fought. CSS variables in
`tokens.css` hold colors, type and spacing.

## 2026-10-19 — Local-first storage (IndexedDB via Dexie), no backend yet

No server is needed until sync. Every task still gets a UUID, `updatedAt` and
a soft-delete `deletedAt` so sync can be added later without reshaping data.

## 2026-10-19 — chrono-node for dates, own code for the rest of parsing

Date parsing (relative days, times, time zones) is a deep problem with a good
library. Extracting the title and any extra syntax is our own code, covered
by tests.

## 2026-10-19 — Overdue tasks get their own section

No red counters or warnings. Overdue tasks sit in a separate section above
Today so they're visible but not loud.

## 2026-10-19 — The database is the source of truth (useLiveQuery)

Instead of keeping tasks in React state and copying every change into
IndexedDB, components read through `useLiveQuery`, which re-runs the query
whenever the table changes. There's only one copy of the data, so it can't
drift, and two open tabs stay in sync for free.

## 2026-10-19 — A bare hour from 1 to 7 means PM

chrono reads "call mom at 3" as 3 AM. In a to-do list that's almost never
what you mean, so a bare hour from 1 to 7 with no am/pm becomes afternoon
(today if it hasn't passed yet). Typing "3am" still means 3 AM. 8 to 12 are
left alone because "standup at 9" usually means morning.

## 2026-10-19 — How tasks are grouped into sections

- **Overdue** means due on an earlier *day*. A task due at 8 AM today stays
  in Today all day; it doesn't become "overdue" at 8:01.
- **No date** is its own section at the bottom, instead of mixing undated
  tasks into Today.
- **Finished tasks** stay visible (crossed out) at the end of Today on the
  day you finish them, then disappear from the page. They stay in the
  database, which keeps the door open for a history view later.

## 2026-10-19 — From to-do list to planner

The app grows beyond tasks: a fixed Pomodoro timer, a week planner,
goals/projects and a weekly review. Habits and a "today" dashboard were
considered and left out. The review page looks back on the week instead of
scoring it, so the app stays calm. It comes last because it needs data from
the timer, the planner and goals.

## 2026-10-19 — Sync with Supabase, online only

Tasks need to be shared between laptop and phone: the phone is for adding a
task quickly, and it has to land in the same list. IndexedDB lives inside one
browser, so it can't do that. Supabase gives a hosted Postgres database plus
sign-in.

Online only, because the phone is always connected and it's far less code
than syncing a local copy in both directions. The cost: no internet, no
tasks. If that becomes a problem, offline support can be added later, and
only `useTasks` talks to storage, so the change stays contained.

Sync comes before the timer, planner and goals so each of those is built on
shared storage from the start instead of being retrofitted.

## 2026-10-19 — Sign in with email and password

Magic links were out: on iPhone, an app added to the home screen has its
own storage, separate from Safari, so a link opened from Mail would sign
Safari in, not the app. An emailed 6-digit code would work, but Supabase's
built-in email service no longer lets you edit the email to include the
code without connecting your own email provider.

Email and password needs no extra service, works the same in the
home-screen app, and iPhone's password manager fills it in. Each device
signs in once and stays signed in.

There's no sign-up in the app. The single account was created by hand in
the Supabase dashboard and sign-ups are turned off, so nobody else can make
an account on this project.

## 2026-10-19 — Optimistic saves

Changes appear on screen immediately and are saved to Supabase in the
background. If a save fails, the app shows a message and reloads from the
database, so the screen never keeps showing something that wasn't saved.
