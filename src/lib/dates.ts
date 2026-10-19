const timeFormat = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" });
const weekdayFormat = new Intl.DateTimeFormat("en", { weekday: "long" });
const dayMonthFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });

/** Whole calendar days from `now` to `date`: 0 today, 1 tomorrow, -1 yesterday. */
export function daysFromToday(date: Date, now: Date = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Math.round absorbs the 23- or 25-hour days around daylight saving changes.
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

/** "today", "tomorrow", "Friday", "Oct 30", with ", 6:00 PM" when there's a time. */
export function formatDue(dueAt: string, hasTime: boolean, now: Date = new Date()) {
  const due = new Date(dueAt);
  const days = daysFromToday(due, now);

  let day: string;
  if (days === 0) day = "today";
  else if (days === 1) day = "tomorrow";
  else if (days === -1) day = "yesterday";
  else if (days > 1 && days < 7) day = weekdayFormat.format(due);
  else day = dayMonthFormat.format(due);

  return hasTime ? `${day}, ${timeFormat.format(due)}` : day;
}
