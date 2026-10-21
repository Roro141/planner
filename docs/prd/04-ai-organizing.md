# 4. AI organizing

What happens after something is dropped: Claude reads it, splits it into
items, and files each one. Nothing waits for approval (section 1).

## Flow

1. A drop is saved (section 3) with status *waiting*.
2. Server code sends it to Claude with some context (below).
3. Claude answers with a list of items in a fixed format.
4. The items are saved, each pointing back to the drop. Status becomes
   *done* and the drop's receipt shows what was made.
5. If anything fails, the drop is marked *couldn't read this* and can be
   retried. The original is never lost.

.ics files skip Claude entirely; they're read directly (section 5).

## What Claude gets

- The drop itself: text, a PDF, an image, or a fetched web page.
- Today's date and my time zone, so "tomorrow" and "friday" make sense.
- My course list (names and codes), so "CS quiz" goes into CS 101.
- My open tasks (titles only), so dumping the same thing twice doesn't
  make a duplicate.

## What Claude sends back

A list. Each entry has:

| Field     | Notes                                                |
|-----------|------------------------------------------------------|
| kind      | task, event, note or snippet                         |
| title     | short, in my own words where possible                |
| when      | due date for tasks, start/end for events, or none    |
| dateClear | `yes`, `vague` or `none`                             |
| dateHint  | the words it was unsure about, like "next week"      |
| course    | an existing course, a new one it spotted, or none    |
| type      | class, exam, assignment, meeting, personal or task   |
| body      | for notes and snippets                               |
| duplicate | set if this matches an open task I already have      |

The format is enforced by the API (structured output), so the app never has
to guess what Claude meant.

## Rules Claude follows

- **Split everything.** A brain dump becomes one item per thing, not one
  big note.
- **Tasks by default.** A short line about something to do is a task.
  Classes, exams, meetings, anything at a set time is an event. Longer text
  to keep is a note. Links, code, addresses and other things to copy are
  snippets.
- **Never invent dates.** Clear dates are used. Vague ones ("next week",
  "soon", "before the midterm") are left empty and flagged.
- **Keep my words.** Titles are trimmed, not rewritten.
- **Courses:** use an existing course when it fits; suggest a new one only
  when the drop clearly names a class.
- **Duplicates:** if it matches an open task, don't add it again. The
  receipt says "already had this".

## Vague dates: a gentle "when?"

Tasks without a clear date land in **No date** with a small, quiet note
showing what I said: *when? "next week"*. Tapping it opens the date picker.
No red, no counter, no notification. It's a hint, not a warning light.

## Fixing mistakes

- Items filed by Claude have a small mark until I edit them.
- Tapping an item lets me change its kind, course, title or date in one
  place. Changing kind (task → event) keeps the title and date.
- Each drop's receipt has **undo this drop**, which removes everything it
  made.
- Later: recent fixes get shown to Claude as examples, so it learns my
  habits.

## Model and cost

- **Claude Opus 5.5** (`claude-opus-5-5`), Anthropic's default model, with
  low effort since sorting is simple. About $4 per million tokens in,
  $20 out.
- Rough cost: a typed brain dump is about 2–3 cents, a 20-page syllabus
  PDF about 15–25 cents. Ten dumps a day comes to roughly $5–10 a month.
- **Cheaper option:** Claude Haiku 5.5 (`claude-haiku-5-5`) costs about 40
  times less ($0.10 in / $0.50 out), so pennies a month, and is likely good
  enough for plain text. Worth testing both once it's built.
- **Spending cap:** a monthly limit in settings (default $10). If it's
  reached, drops wait until next month or until I raise it.

## Privacy

- What I drop is sent to Anthropic to be read. Nothing else is (no feed
  URLs, no other data beyond the context listed above).
- The API key is stored as a server secret, never sent to the browser.

## Setup (once)

- Create an account at console.anthropic.com, add a payment method, and set
  a monthly spending limit there too.
- Create an API key and save it as a Supabase secret.
