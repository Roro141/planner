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
