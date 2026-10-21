# 2. Data model

What the app stores once the inbox exists. Field names are a guide; exact
columns get decided when each part is built.

## The main idea

One dump can turn into many items. Pasting "essay due friday, CS quiz
tuesday 10am, buy printer ink, notes from today's lecture: ..." should give
three tasks, one event and one note, each with the right date and course.
So the app keeps two things:

- **The drop:** exactly what I put in, untouched.
- **The items:** what the AI pulled out of it, each pointing back to the drop.

If the AI gets something wrong, the original is still there to check.

## Kinds of item

Tasks, events and notes are kept in separate tables because they need
different fields. Snippets are a kind of note.

| Kind    | Has                                  | Shows on                 |
|---------|--------------------------------------|--------------------------|
| Task    | title, due date (optional), done     | Today, calendar if dated |
| Event   | title, start, end, location          | Calendar                 |
| Note    | title, body                          | Notes (section 7)        |
| Snippet | title, body (a link, code, address)  | Notes, marked as snippet |

## Fields every item shares

On top of what tasks already have (id, created/updated/deleted dates):

| Field       | Notes                                                       |
|-------------|-------------------------------------------------------------|
| courseId    | optional, the course it belongs to                          |
| type        | class, exam, assignment, meeting, personal or task (section 6) |
| filedBy     | `me`, `ai` or `feed`, so automatic items can be marked      |
| dropId      | optional, the drop it came from                             |
| feedId      | optional, the feed it came from                             |
| externalUid | optional, the item's ID in the source (the .ics `UID`)      |
| editedByMe  | which fields I've changed myself (see "Feeds and my edits") |

## Event

| Field    | Type            | Notes                         |
|----------|-----------------|-------------------------------|
| title    | string          |                               |
| startsAt | ISO string      |                               |
| endsAt   | ISO string/null |                               |
| allDay   | boolean         |                               |
| location | string/null     |                               |
| url      | string/null     | link back, e.g. to Canvas     |

## Note

| Field | Type        | Notes                         |
|-------|-------------|-------------------------------|
| kind  | note/snippet|                               |
| title | string      | written by the AI if missing  |
| body  | text        | Markdown                      |

## Course

| Field | Type        | Notes                              |
|-------|-------------|------------------------------------|
| name  | string      | "Intro to Computer Science"        |
| code  | string/null | "CS 101", used to match            |
| color | string      | one of a few soft colors, for the calendar |

Types (class, exam...) also have a color each, so the calendar can be
colored either way (section 6).

Courses are created automatically the first time the AI or a feed sees one.
Canvas adds the course to each event's title, so feed items get grouped
without any setup. I can rename, recolor or merge courses later.

## Drop

| Field     | Type                       | Notes                               |
|-----------|----------------------------|-------------------------------------|
| kind      | text / file / link         |                                     |
| text      | text/null                  | pasted or typed content             |
| filePath  | string/null                | in file storage                     |
| status    | waiting / done / failed    | failed drops stay visible to retry  |
| createdAt | ISO string                 |                                     |

## Feed

| Field         | Type            | Notes                                |
|---------------|-----------------|--------------------------------------|
| name          | string          | "Canvas"                             |
| url           | string          | secret, only readable by the server  |
| lastCheckedAt | ISO string/null |                                      |
| lastError     | string/null     | shown quietly if checking fails      |

## No duplicates

An item from a calendar (feed or dropped .ics file) is matched by its
`externalUid`. If an item with that UID already exists, it's updated instead
of added again. Dropping the same file twice changes nothing.

## Feeds and my edits

- If Canvas changes something I haven't touched, my copy follows.
- If I've changed a field myself (moved a due date, renamed it), the feed
  leaves that field alone.
- Finishing a task never gets undone by a feed.
- If an assignment disappears from the feed, the task is removed, unless I've
  finished or edited it.

## Privacy

Everything stays behind the same per-user rules as tasks today. Feed URLs
and the AI key are only ever read by server code, never sent to the browser.
