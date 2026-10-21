/**
 * How a recurring task repeats. Stored as JSON in tasks.recurrence.
 * Weekdays are numbered like Date.getDay(): 0 is Sunday, 6 is Saturday.
 */
export type Recurrence =
  | { kind: "daily" }
  | { kind: "weekdays" }
  | { kind: "weekly"; days: number[] }
  | { kind: "monthly"; day: number }
  | { kind: "interval"; days: number };

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The given day of the month, or the month's last day if it's shorter (31 → 30 Apr). */
function onDayOfMonth(year: number, month: number, day: number, time: Date) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const date = new Date(time);
  date.setFullYear(year, month, Math.min(day, lastDay));
  return date;
}

/** Whether a day-based rule lands on this date. Monthly and interval rules count from the due date instead. */
function landsOn(rule: Recurrence, date: Date) {
  const weekday = date.getDay();
  switch (rule.kind) {
    case "daily":
      return true;
    case "weekdays":
      return weekday >= 1 && weekday <= 5;
    case "weekly":
      return rule.days.includes(weekday);
    case "monthly":
      return date.getDate() === rule.day;
    case "interval":
      return true;
  }
}

/** The first date on or after `start` that the rule lands on, keeping start's time of day. */
export function firstOccurrence(rule: Recurrence, start: Date) {
  if (rule.kind === "monthly") {
    const thisMonth = onDayOfMonth(start.getFullYear(), start.getMonth(), rule.day, start);
    if (startOfDay(thisMonth) >= startOfDay(start)) return thisMonth;
    return onDayOfMonth(start.getFullYear(), start.getMonth() + 1, rule.day, start);
  }
  let date = new Date(start);
  for (let i = 0; i < 7 && !landsOn(rule, date); i++) date = addDays(date, 1);
  return date;
}

function stepAfter(rule: Recurrence, due: Date) {
  switch (rule.kind) {
    case "interval":
      return addDays(due, rule.days);
    case "monthly":
      return onDayOfMonth(due.getFullYear(), due.getMonth() + 1, rule.day, due);
    default:
      return firstOccurrence(rule, addDays(due, 1));
  }
}

/**
 * The next due date after finishing a task that was due on `due`: the first
 * one after both `due` and today. Finishing a daily task that's a week
 * overdue gives tomorrow, not the day after it was due.
 */
export function nextOccurrence(rule: Recurrence, due: Date, now: Date = new Date()) {
  const today = startOfDay(now);
  let next = stepAfter(rule, due);
  // Bounded so a broken rule can never loop forever.
  for (let i = 0; i < 5000 && startOfDay(next) <= today; i++) next = stepAfter(rule, next);
  return next;
}

/** "every day", "weekdays", "every Monday", "every Mon & Thu", "every month", "every 3 days". */
export function describeRecurrence(rule: Recurrence) {
  switch (rule.kind) {
    case "daily":
      return "every day";
    case "weekdays":
      return "weekdays";
    case "weekly": {
      const days = [...rule.days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
      if (days.length === 1) return `every ${DAY_NAMES[days[0]]}`;
      return `every ${days.map((d) => SHORT_DAY_NAMES[d]).join(" & ")}`;
    }
    case "monthly":
      return "every month";
    case "interval":
      return rule.days === 2 ? "every other day" : `every ${rule.days} days`;
  }
}

// ---- Reading a rule out of quick-add text ----

const DAY = String.raw`(?:sun(?:day)?|mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:r(?:s(?:day)?)?)?|fri(?:day)?|sat(?:urday)?)s?`;
const DAY_LIST = new RegExp(String.raw`\bevery\s+(${DAY}(?:\s*(?:,|and|&|\+)\s*${DAY})*)\b`, "i");

function weekdayNumber(word: string) {
  const prefix = word.toLowerCase().slice(0, 2);
  return ["su", "mo", "tu", "we", "th", "fr", "sa"].indexOf(prefix);
}

type Found = { match: string; index: number; make: (start: Date) => Recurrence };

function find(text: string): Found | null {
  const patterns: [RegExp, (m: RegExpMatchArray) => (start: Date) => Recurrence][] = [
    [/\b(?:every\s*day|daily)\b/i, () => () => ({ kind: "daily" })],
    [/\b(?:every\s+week\s*days?|week\s*days)\b/i, () => () => ({ kind: "weekdays" })],
    [/\bevery\s+other\s+day\b/i, () => () => ({ kind: "interval", days: 2 })],
    [
      /\bevery\s+(\d{1,3})\s+days?\b/i,
      (m) => () => ({ kind: "interval", days: Math.max(1, Number(m[1])) }),
    ],
    [
      DAY_LIST,
      (m) => () => {
        const words = m[1].split(/\s*(?:,|and|&|\+)\s*/i);
        const days = [...new Set(words.map(weekdayNumber).filter((d) => d >= 0))];
        return { kind: "weekly", days };
      },
    ],
    [/\b(?:every\s+week|weekly)\b/i, () => (start) => ({ kind: "weekly", days: [start.getDay()] })],
    [/\b(?:every\s+month|monthly)\b/i, () => (start) => ({ kind: "monthly", day: start.getDate() })],
  ];

  for (const [pattern, build] of patterns) {
    const m = text.match(pattern);
    if (m && m.index !== undefined) return { match: m[0], index: m.index, make: build(m) };
  }
  return null;
}

/**
 * Pulls a repeat phrase ("every monday", "daily", "every 3 days") out of
 * the text. Returns the text without it, and a function that builds the
 * rule once the start date is known (weekly and monthly rules take their
 * day from it).
 */
export function extractRecurrence(text: string) {
  const found = find(text);
  if (!found) return null;
  const rest = text.slice(0, found.index) + " " + text.slice(found.index + found.match.length);
  return { rest, make: found.make };
}
