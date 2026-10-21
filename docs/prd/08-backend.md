# 8. Backend

Until now the app had no server code: the browser talks straight to
Supabase. The inbox needs a few things a browser can't do safely, so they
run as small server functions on Supabase, which already holds the data.

## Why a server now

- **Secrets:** the Claude API key, feed links and notification keys must
  never reach the browser.
- **Fetching feeds:** browsers can't read Canvas or Google calendar links
  directly (blocked by CORS), and checks must run while the app is closed.
- **Schedules:** hourly feed checks, reminders every minute.
- **Phone shortcut:** needs an address to send drops to.

## Pieces

All on Supabase, so there's one service to manage.

| Piece                | What it does                                              |
|----------------------|-----------------------------------------------------------|
| `process-drop`       | Runs when a drop is saved: sends it to Claude, saves items |
| `drop-in`            | Address the iPhone Shortcut sends to; checks the personal token, saves a drop |
| `check-feeds`        | Every hour (and on "check now"): fetches each feed, updates items by UID |
| `send-reminders`     | Every minute: sends notifications for tasks due now (SPEC.md reminders) |
| File storage         | A private `drops` bucket for dropped files, one folder per user |
| Scheduled jobs       | `pg_cron` starts the hourly and per-minute functions       |
| Secrets              | `ANTHROPIC_API_KEY`, notification keys                     |

Server functions are written in TypeScript like the rest of the app, in
`supabase/functions/`. Pure logic (reading .ics files, matching UIDs,
turning Claude's answer into items) lives in shared files with Vitest
tests, like `parseTask` today.

## Keeping secrets secret

- Feed links are stored in a table the browser can't read at all. The page
  only sees each feed's name and status.
- The personal token for the shortcut is stored scrambled (hashed), like a
  password. It can only add drops.
- Every new table gets the same per-user security rules as `tasks`.

## Spending

Every Claude call is logged with its token count and cost in an `ai_usage`
table. `process-drop` checks the monthly total against the cap from
section 4 before calling Claude.

## Database changes

From here on, database changes are kept as numbered migration files in
`supabase/migrations/` and applied with the Supabase command-line tool,
instead of pasting `schema.sql` into the dashboard. The existing schema
becomes the first migration.

## Cost

The free Supabase plan covers this easily (about 45,000 function runs a
month against a limit of 500,000; 1 GB of file storage). Free projects
pause after a week without use, which daily use avoids. The only real cost
is Claude (section 4).

## Setup I do once

1. Install the Supabase command-line tool, log in, and link this project.
2. Turn on the `pg_cron` and `pg_net` extensions in the dashboard.
3. Add the secrets (Claude API key, notification keys) in the dashboard.

Step-by-step instructions get written when this is built.
