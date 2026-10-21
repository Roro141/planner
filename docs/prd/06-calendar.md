# 6. Calendar

One calendar with everything on it: Canvas, Google, what Claude pulled out
of drops, and tasks I typed. It replaces the separate week planner in
SPEC.md.

## Views

A switch at the top: **Month | Week**. The app remembers which one I used
last.

### Month

- The whole month as a grid, like a paper wall calendar.
- Each day shows small colored lines for its items (time, then title). If
  there are too many, the last line says *+3 more*.
- Tapping a day opens that day's full list.
- Arrows to step to the previous and next month, and **today** to jump back.

### Week

Two modes, with a small toggle: **Planner | Schedule**.

- **Planner** (default): seven columns, one per day, each a simple list of
  that day's tasks and events. Drag a task to another day to reschedule it.
  This is the week planner from SPEC.md.
- **Schedule:** the same week as a time grid, like Google Calendar, with
  each event placed at its time and length. Useful for seeing exactly when
  classes and exams are. All-day items and tasks without a time sit in a
  strip at the top.

On the phone, the week view shows one day at a time, swiping between days.

## Types

Every item on the calendar has a type, like Google Calendar's separate
calendars:

| Type       | Examples                                  |
|------------|-------------------------------------------|
| Class      | lectures, labs, recitations               |
| Exam       | quizzes, midterms, finals                 |
| Assignment | Canvas assignments, homework, essays      |
| Meeting    | office hours, group meetings, appointments|
| Personal   | everything else from Google, my own stuff |
| Task       | tasks I typed that aren't one of the above|

Claude picks the type when it files a drop. Feeds get it from the entry
(Canvas assignments are assignments; "Midterm" in a title means exam).
I can change it on any item.

## Filters

A small panel (a sidebar on the laptop, a sheet on the phone) with
checkboxes, like Google Calendar's calendar list:

- **By type:** class, exam, assignment, meeting, personal, task.
- **By course:** each course, plus "no course".
- **By feed:** Canvas, each Google calendar, my own items.

Unchecking hides those items from the calendar only, never from Today.
The checkboxes are remembered.

## Colors

One switch: **Color by: Course | Type**.

- **By course:** each course has its own color, so all of CS 101 looks
  the same. Items without a course use a neutral shade.
- **By type:** classes one color, exams another, and so on.

Colors are a small set of soft, muted shades that sit well on the paper
background, in the same family as the existing rose accent. They're defined
in `tokens.css` like every other color. I can pick a different color for a
course or type from that set.

## Look

Matches the app as it is now: warm paper background, ink-colored text,
Fraunces for headings, the handwritten font for small notes (*nothing
today*), thin lines in `--line` for the grid. Calm:

- Today is circled softly, not highlighted in a bright box.
- Overdue tasks look the same as others, just in their past day.
- Finished tasks are crossed out, like on Today.
- Weekends are a touch lighter.

## Tapping an item

Opens a small card with its details: title, time, course, type, where it
came from (with a link back to Canvas or the original drop), and a body for
notes. Everything can be edited there, using the same edit card as
section 4.

## Not doing (for now)

- Creating events by dragging on the time grid. Typing or dropping is the
  way in.
- Day view on the laptop (week schedule covers it).
- Sharing or printing the calendar.
