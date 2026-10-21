# 1. Vision and principles

## The idea

I shouldn't have to copy things into my planner. Assignments are already in
Canvas, dates are already in syllabi and emails, links and notes are already
on my clipboard. The planner should take all of that as it is and sort it
for me.

Two ways in:

- **Dump:** drop a file (.ics, PDF, notes, a link) or paste whatever is on the
  clipboard, on the laptop or from the iPhone share menu. The app reads it, pulls out the tasks, events, notes and
  snippets, and files each one.
- **Feeds:** paste a calendar URL once (Canvas and my Google calendars). The app keeps checking
  it, adds new items, and updates changed ones without making duplicates.

Everything ends up in one place: tasks on Today, events and due dates on one
calendar, notes and snippets where I can find them again.

## Who it's for

Me. One person, mostly a student: Canvas for classes, a laptop for planning,
a phone for quick capture.

## Principles

The calm principles in [SPEC.md](../../SPEC.md#principles) still apply. These
are added:

- **Dump, don't sort.** Putting something in is one action. No forms, no
  picking a category first.
- **Filed right away.** The AI files everything immediately. Nothing waits
  for my approval.
- **Easy to fix.** Because nothing waits for approval, every item shows that
  it was filed automatically, and moving or retyping it takes one step.
- **Every item knows where it came from.** A task from Canvas links back to
  the assignment; a note from a PDF links back to the file.
- **Feeds don't duplicate.** If Canvas moves a due date, the existing task
  moves. If an assignment is removed, the task goes away (unless I've
  already changed or finished it).
- **Set up once.** A feed is a URL pasted one time. No accounts to connect
  and nothing to configure after that.
- **Imports stay calm.** Bringing in a whole semester doesn't flood Today.
  Items show up when they're due, like anything else.

## What success looks like

- I never type a Canvas due date by hand.
- Dropping a syllabus PDF puts its exams on the calendar and its assignments
  in my tasks.
- I can find a link or note I pasted weeks ago.

## Not doing (for now)

- **Projects or goals.** The planned Goals/projects feature is dropped.
  Items are grouped by course instead (see section 2).
- **Writing back to Canvas** or any other source. Feeds are read-only.
- **Sharing or collaboration.** Still one user.
- **Offline support.** Still online only.
- **A review step before filing.** Fixing after is the model.
- **An MCP server for Claude.** The Claude account is shared with other
  people, so letting it read my items would get complicated.

## Order

This comes after the current SPEC.md roadmap is finished. See
[Phases](../PRD.md#phases).
