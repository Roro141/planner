import { isTauri } from "@tauri-apps/api/core";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { exit } from "@tauri-apps/plugin-process";

/** Things only the desktop app can do. Safe to call in a browser: they do nothing. */

const FIRST_RUN_KEY = "planner.widget.started-before";

/**
 * Whether the widget starts with Windows. On the very first run it's
 * switched on, since a desktop widget is meant to be there every day.
 */
export async function startsWithWindows(): Promise<boolean> {
  if (!isTauri()) return false;
  try {
    if (!localStorage.getItem(FIRST_RUN_KEY)) {
      localStorage.setItem(FIRST_RUN_KEY, "1");
      await enable();
    }
    return await isEnabled();
  } catch {
    return false;
  }
}

export async function setStartsWithWindows(on: boolean) {
  if (!isTauri()) return;
  await (on ? enable() : disable());
}

export function quit() {
  if (isTauri()) void exit(0);
}
