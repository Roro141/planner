# Desktop widget

A small bubble that floats in the corner of the Windows desktop. Click it
and a card opens with today's tasks, a line to add new ones, and a mini
focus timer. It uses the same account as the website, so changes show up
on both within a second.

The code: `src/widget/` (the bubble and card, written like the rest of the
app) and `src-tauri/` (Tauri, the small Windows app around it).

## Using it

- **Open / close:** click the bubble. Clicking anywhere else, or Esc, also
  closes it.
- **Move it:** press on the bubble and drag. It remembers the spot.
- **Add a task:** type in the card. Without a date it's for today;
  "essay friday 6pm" and "gym every monday" work like on the website.
- **Timer:** start/pause in the card. While it runs, a ring fills up
  around the bubble. Finished sessions count in the weekly review. (The
  widget's timer is separate from the website's timer.)
- **Start with Windows:** on by default, checkbox at the bottom of the card.
- **Quit:** at the bottom of the card. Open it again from the Start menu
  ("Planner Widget").

## One-time setup on this laptop

Building a Tauri app needs Rust and Microsoft's C++ build tools. In a
terminal (PowerShell is fine):

```
winget install --id Rustlang.Rustup
winget install Microsoft.VisualStudio.2022.BuildTools --override "--passive --wait --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

The second one is big (about 2 GB) and takes a while. Then close and reopen
the terminal (and VS Code) so it finds `cargo`. Check with:

```
cargo --version
```

## Building and installing

From the project folder:

```
npm run tauri build
```

The first build takes several minutes (it compiles everything once); later
ones are much faster. It makes an installer at:

```
src-tauri/target/release/bundle/nsis/Planner Widget_0.1.0_x64-setup.exe
```

Run it once. The widget starts, and from then on starts with Windows.

The installer has your Supabase settings from `.env.local` built in (the
same public values the website uses), so build it on this laptop.

## Trying changes without installing

```
npm run tauri dev
```

Opens the widget with live reload: edits to `src/widget/` show up straight
away.

## Updating

After changing the code: `npm run tauri build` again and run the new
installer. It replaces the old version.
