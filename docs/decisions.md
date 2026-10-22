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

## 2026-10-21 — Inbox: dump anything, the app sorts it

The next big step after the current roadmap: drop files or paste anything,
and the app turns it into tasks, events, notes and snippets. Feeds like the
Canvas calendar keep themselves up to date. Planned in
[PRD.md](PRD.md). It comes after the SPEC.md roadmap is finished.

## 2026-10-21 — AI files everything right away

No approval step. Approving every item would bring back the sorting work the
inbox is meant to remove. Instead, items show they were filed automatically
and are quick to fix.

## 2026-10-21 — Goals/projects dropped

Probably wouldn't get used much. A simple course label may replace it for
sorting by class. (Decided: items are grouped by course, created automatically.)

## 2026-10-21 — iPhone Shortcut instead of texting a number

Sending a text to a number needs a paid service and US registration. An
iPhone Shortcut does the same job for free: it sits in the share menu, works
with Siri, and can go on the home screen as a Shortcuts widget. It sends
drops with a personal token that can only add drops.

## 2026-10-21 — Google Calendar is read-only, through its iCal links

Each Google calendar has a private iCal address. Using it the same way as
Canvas means no Google sign-in and no extra code path. Events can't be
edited from the app; that's fine for now.

## 2026-10-21 — Claude reads the drops; vague dates stay empty

Claude (Anthropic's API) splits and files each drop, returning a fixed
format the app can trust. It never guesses a date: something like "next
week" becomes a task with no date and a quiet *when?* note showing the
original words, so I fix it with one tap instead of finding a wrong date
later.

## 2026-10-21 — Feeds checked hourly, from today onward

Due dates rarely change minute to minute, and anything urgent gets typed in
by hand anyway, so an hourly check (plus a "check now" button) is enough.
The first import skips the past so adding a feed mid-semester stays calm.
Past items are never removed when they drop out of a feed, because feeds
drop old entries on their own.

## 2026-10-21 — One calendar, and the week planner is its week view

Month and week views behind a switch. The week view has a Planner mode
(day lists, drag tasks between days: the planned week planner) and a
Schedule mode (time grid like Google Calendar), so there's one page instead
of two. Items have a type (class, exam, assignment...) and can be colored by
course or by type with one switch.

## 2026-10-21 — Server code runs on Supabase

The inbox needs secrets, scheduled jobs and feed fetching, which can't run
in the browser. Supabase Edge Functions with pg_cron keep everything in the
service that already holds the data, instead of adding Vercel functions as
a second backend. Database changes move to migration files.

## 2026-10-21 — No MCP server; desktop grabs the clipboard only on a shortcut

The Claude account is shared, so connecting it to my items would mix
things up; the MCP server is dropped. The desktop app sends the current
clipboard to the inbox when I press a shortcut, and keeps no history,
which avoids recording passwords and everything else I copy.

## 2026-10-21 — A tiny router of our own

Four pages don't need a routing library: the page comes from the URL path,
links use history.pushState, and Vercel sends every path to index.html
(vercel.json). Tasks are loaded once in a shell around the pages, so
switching pages is instant and every page sees the same list.

## 2026-10-21 — Weeks start on Monday

The week planner and review both use Monday to Sunday.

## 2026-10-21 — Repeats create the next task when one is finished

A repeating task is one row at a time, not a series expanded in advance.
Finishing it creates the next one right away, dated after both the old due
date and today, so a week-overdue daily task doesn't leave a trail of old
copies. Un-finishing takes the new one back.

## 2026-10-21 — Focus timer state lives in the browser

The running timer is kept in localStorage (as an end time, not a counter),
so it keeps going while switching pages, across reloads, and while the
laptop sleeps. Only finished sessions go to the database, saved by id so a
session can't be recorded twice.

## 2026-10-21 — Reminders through web push and a cron job

A Supabase Edge Function runs every minute (pg_cron), stamps due tasks as
reminded, and sends a push to every device that turned reminders on. The
cron job proves itself with a shared secret header, so the function doesn't
depend on which kind of Supabase API key the project uses. Moving a task to
a new time clears the stamp (a database trigger), so it reminds again.

## 2026-10-21 — One dashboard instead of separate pages

Everything on one page is easier to take in than switching tabs: the
dashboard shows today, the focus timer, the review and the week as cards.
Each card can still be opened on its own, full size, under its old address
(/today, /week, /focus, /review), and the app now opens on the dashboard.
Sections size themselves to their card with CSS container queries, so the
same component works small on the dashboard and big on its own.

## 2026-10-21 — Movable, resizable dashboard cards with react-grid-layout

Dragging and resizing cards on a snapping grid is fiddly to get right by
hand (collisions, compaction, touch), so this uses react-grid-layout, a
long-established library. Cards move only by their grip, so dragging tasks
inside the week card still works. The arrangement is saved per device in
localStorage, because a laptop and a big monitor want different layouts; on
narrow screens the cards stack in a fixed order and can't be moved.

## 2026-10-22 — Desktop widget as a Tauri app sharing the web code

The widget is a second page (widget.html) of the same Vite project, so it
reuses the task list, quick add, sign-in and focus timer code as they are.
Tauri wraps it in one small borderless, see-through, always-on-top window
that resizes between the bubble and the card. Tauri over Electron for a much
smaller app and lighter memory use, which matters for something that runs
all day; the cost is a one-time Rust install to build it. A task added in
the widget without a date is for today, since the widget only shows today.
