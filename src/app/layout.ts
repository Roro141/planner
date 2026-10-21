import type { Layout, LayoutItem } from "react-grid-layout";

/**
 * Where each dashboard card sits and how big it is, in grid units: 12
 * columns across, rows of ROW_HEIGHT pixels with GAP between them. Kept per
 * device in localStorage, since a laptop and a big monitor want different
 * arrangements.
 */

export const COLUMNS = 12;
export const ROW_HEIGHT = 24;
export const GAP = 20;

export const CARD_IDS = ["today", "focus", "review", "week"] as const;
export type CardId = (typeof CARD_IDS)[number];

/** Smallest a card can be made, so its contents stay usable. */
const LIMITS: Record<CardId, Pick<LayoutItem, "minW" | "minH">> = {
  today: { minW: 4, minH: 6 },
  focus: { minW: 3, minH: 8 },
  review: { minW: 3, minH: 6 },
  week: { minW: 5, minH: 7 },
};

export const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: "today", x: 0, y: 0, w: 7, h: 19, ...LIMITS.today },
  { i: "focus", x: 7, y: 0, w: 5, h: 9, ...LIMITS.focus },
  { i: "review", x: 7, y: 9, w: 5, h: 15, ...LIMITS.review },
  { i: "week", x: 0, y: 24, w: 12, h: 10, ...LIMITS.week },
];

const STORAGE_KEY = "planner.dashboard-layout.v1";

/** The saved layout, or the default if there's none (or it's damaged). */
export function loadLayout(): LayoutItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!Array.isArray(saved)) return DEFAULT_LAYOUT;
    const items = CARD_IDS.map((id) => saved.find((item: LayoutItem) => item?.i === id));
    if (items.some((item) => !item || ![item.x, item.y, item.w, item.h].every(Number.isFinite))) {
      return DEFAULT_LAYOUT;
    }
    // Limits come from the code, not storage, so changing them here applies.
    return items.map((item: LayoutItem) => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      ...LIMITS[item.i as CardId],
    }));
  } catch {
    return DEFAULT_LAYOUT;
  }
}

export function saveLayout(layout: Layout) {
  try {
    const plain = layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plain));
  } catch {
    // Not saved; the arrangement still holds until the page reloads.
  }
}

export function clearLayout() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
