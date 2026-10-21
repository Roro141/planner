import * as chrono from "chrono-node";
import { extractRecurrence, firstOccurrence, type Recurrence } from "../recurrence";

export type ParsedTask = {
  title: string;
  /** ISO timestamp, or null when no date was found. */
  dueAt: string | null;
  hasTime: boolean;
  /** Only present for repeating tasks ("gym every monday"). */
  recurrence?: Recurrence;
};

// Words that only connect the title to the date ("submit report BY friday").
// Once the date is cut out they're left dangling, so they go too.
const CONNECTOR = /\s+(?:at|by|on|due|for)\s*$/i;

// A bare hour like "at 3" is almost always afternoon in a to-do list.
const LAST_HOUR_ASSUMED_PM = 7;

/**
 * Turns "Finish assignment tomorrow at 6pm" into a title and a due date, and
 * "gym every monday 7am" into a repeating task. `now` is a parameter instead
 * of `new Date()` so tests can pin the clock.
 */
export function parseTask(text: string, now: Date = new Date()): ParsedTask {
  const input = text.trim();
  const repeat = extractRecurrence(input);

  // Only treat it as repeating if something is left to be the title.
  if (repeat && cleanTitle(repeat.rest)) {
    const parsed = parseDate(repeat.rest, now);
    if (parsed.title) {
      // No date given: start today. Weekly and monthly rules take their day
      // from the start, then the first matching day becomes the due date.
      const start = parsed.dueAt
        ? new Date(parsed.dueAt)
        : new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const recurrence = repeat.make(start);
      return {
        title: cleanTitle(parsed.title),
        dueAt: firstOccurrence(recurrence, start).toISOString(),
        hasTime: parsed.hasTime,
        recurrence,
      };
    }
  }

  return parseDate(input, now);
}

function parseDate(text: string, now: Date): ParsedTask {
  const input = text.trim();
  const [match] = chrono.parse(input, now, { forwardDate: true });

  if (!match) {
    return { title: input, dueAt: null, hasTime: false };
  }

  const before = input.slice(0, match.index).replace(CONNECTOR, "");
  const after = input.slice(match.index + match.text.length);
  const title = cleanTitle(`${before} ${after}`);

  // If the date was the whole input ("tomorrow"), keep the text as the title
  // rather than creating a task with no name.
  if (!title) {
    return { title: input, dueAt: null, hasTime: false };
  }

  const hasTime = match.start.isCertain("hour");
  const due = match.start.date();

  if (!hasTime) {
    due.setHours(0, 0, 0, 0);
  } else if (!match.start.isCertain("meridiem") && due.getHours() <= LAST_HOUR_ASSUMED_PM) {
    due.setHours(due.getHours() + 12);
    // chrono pushed "3am" to tomorrow because it had passed; 3pm today may not have.
    const sameTimeToday = new Date(due);
    sameTimeToday.setDate(due.getDate() - 1);
    if (sameTimeToday > now) due.setTime(sameTimeToday.getTime());
  }

  return { title, dueAt: due.toISOString(), hasTime };
}

function cleanTitle(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/^[\s,:;–—-]+|[\s,:;–—-]+$/g, "")
    .trim();
}
