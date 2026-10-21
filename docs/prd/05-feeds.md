# 5. Feeds: Canvas and Google calendars

Calendar links the app checks by itself, so I never copy dates by hand.
All feeds are read-only: nothing is ever sent back.

## Adding a feed

In settings: **add a feed**, paste the link, give it a name. That's it.

| Source          | Where to find the link                                         |
|-----------------|----------------------------------------------------------------|
| Canvas          | Calendar → "Calendar Feed" at the bottom → copy the link       |
| Google Calendar | Settings → pick a calendar → "Secret address in iCal format"   |

Each Google calendar has its own link, so each one is added as its own
feed (class schedule, work, personal...).

The links contain a secret, so they're saved where only server code can
read them. The page only ever shows the name.

## How often

- **Every hour**, in the background, even when the app is closed.
- A **check now** button next to each feed, for when I've just changed
  something in Canvas.
- Anything urgent I type in myself; the feed catches up within the hour.

## First import

Only items from **today onward** come in. Past assignments and old events
are skipped, so adding Canvas mid-semester doesn't dump months of history
into the app.

## What becomes what

| From                                   | Becomes                              |
|----------------------------------------|--------------------------------------|
| Canvas assignment (has a due date)     | Task, due then, shows on Today       |
| Other Canvas calendar entries          | Event                                |
| Anything from Google Calendar          | Event                                |

Canvas marks assignments in each entry's ID and puts the course name in
brackets in the title ("Essay 2 [ENG 102]"). The app uses that to tell
assignments apart and to put each item in the right course, with the
brackets removed from the title. (To check against my real feed when
building.)

Repeating Google events (a class every Tuesday) are expanded into separate
events on the calendar, for the coming months.

## Keeping in sync

Every entry in a calendar feed has a fixed ID (`UID`). The app uses it to
match entries to items it already has (section 2):

- **New entry:** added.
- **Changed entry** (new due date, new title, moved event): my copy is
  updated, except for any field I've changed myself.
- **Entry gone from the feed:** the item is removed, but only if it's in the
  future and I haven't finished or edited it. Past items are never removed,
  because feeds drop old entries on their own.
- **Finished tasks stay finished**, whatever the feed says.

Feed items are marked as coming from that feed and link back to the
original (the Canvas assignment page, for example).

## When something goes wrong

If a feed can't be read (link revoked, Canvas down), the app keeps the
items it has and shows a quiet note next to the feed in settings:
*couldn't check Canvas since 2pm*. After a day of failures it also shows
once on Today. No alarms.

## Removing a feed

Removing a feed deletes its future items that I haven't touched. Anything
I've finished or edited stays.

## Not doing (for now)

- Editing or adding events back into Google Calendar or Canvas.
- Signing in with Google (the iCal link is enough).
- Other kinds of feeds (RSS, email). Any calendar that gives an .ics link
  works, though: Outlook and Apple Calendar too.
