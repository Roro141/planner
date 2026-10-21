# 3. Inbox capture

How things get into the app. What happens to them after that is section 4.

## Ways in

| Where          | How                                                      | When       |
|----------------|----------------------------------------------------------|------------|
| Laptop         | Inbox page: paste, type, or drag files in                | Phase 2    |
| iPhone         | "Dump to Planner" shortcut: share menu, Siri, widget     | Phase 2    |
| Feeds          | Canvas and Google calendar links, checked automatically (section 5) | Phase 2 |
| Laptop desktop | A shortcut that sends the clipboard (section 10)         | Later      |

Quick add on Today stays as it is: one line, one task, no AI.

## The inbox page

A separate page, reached from the navigation.

- **One big box.** Type or paste anything: one line, a whole brain dump, a
  link, a pasted email. Press enter (or ⌘/Ctrl+Enter for multi-line) to drop
  it.
- **Paste anywhere on the page** drops whatever is on the clipboard,
  including screenshots.
- **Drag files** onto the page, several at once.
- **Recent drops** list underneath, newest first, like receipts:
  - *reading…* while the AI works
  - *3 tasks, 1 event in CS 101*: tap to see and fix each item
  - *couldn't read this*: with a retry button. Nothing is ever lost.
- Drops older than a week fold away, so the page never becomes a pile. They
  stay in the database.

## What can be dropped

| Type                 | What happens                                          |
|----------------------|-------------------------------------------------------|
| Text                 | AI splits it into tasks, events, notes, snippets      |
| Link                 | Page is fetched; AI decides (usually a snippet)       |
| .ics file            | Read directly, no AI needed; matched by UID           |
| PDF                  | Text pulled out, then AI; scanned pages read as images |
| Image / screenshot   | AI reads it (a photo of a syllabus, a flyer)          |
| .txt / .md           | Same as text                                          |
| .docx                | Same as text (if easy; otherwise later)               |

Limit: 20 MB per file. Anything else is kept as a file and marked
*couldn't read this*.

## iPhone: "Dump to Planner"

An iPhone Shortcut I install once. It sends whatever it's given to the app.

- **Share menu:** share a screenshot, link, photo, PDF or text from any app.
- **Siri:** "Dump to Planner", then say it out loud ("history essay due
  Thursday").
- **Widget:** the Shortcuts widget on the home screen or lock screen, or the
  Action button / Control Center: one tap, type or dictate.
- **No typing needed:** if nothing is shared, it asks for text or dictation.

The shortcut can't sign in like the app does, so it uses a **personal
token**: a long secret made in the app's settings, pasted into the shortcut
once. It can only add drops, nothing else, and I can replace it any time.

Setup steps (copy the token, install the shortcut) will be shown in the app.

## Not doing (for now)

- **Texting a phone number.** Possible with a paid service (Twilio, about
  $1–2 a month) but the shortcut does the same for free.
- **Email-in address.** Could be added later for forwarding emails.
- **A widget that shows today's tasks.** A website can't make iPhone widgets.
  Later options: the free Scriptable app, or a small native app.
- **Offline drops.** If there's no internet, the drop fails and says so.
