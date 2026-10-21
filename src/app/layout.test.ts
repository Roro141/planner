import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_LAYOUT, loadLayout, saveLayout } from "./layout";

// A minimal in-memory localStorage for the test environment.
beforeEach(() => {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage;
});

describe("dashboard layout", () => {
  it("starts with the default arrangement", () => {
    expect(loadLayout()).toEqual(DEFAULT_LAYOUT);
  });

  it("remembers where cards were moved, keeping the size limits", () => {
    const moved = DEFAULT_LAYOUT.map((item) => (item.i === "focus" ? { ...item, x: 0, y: 0, w: 4 } : item));
    saveLayout(moved);
    const focus = loadLayout().find((item) => item.i === "focus");
    expect(focus).toMatchObject({ x: 0, y: 0, w: 4, minW: 3, minH: 8 });
  });

  it("falls back to the default if what's saved is broken or incomplete", () => {
    localStorage.setItem("planner.dashboard-layout.v1", "not json");
    expect(loadLayout()).toEqual(DEFAULT_LAYOUT);
    localStorage.setItem("planner.dashboard-layout.v1", JSON.stringify([{ i: "today", x: 0, y: 0, w: 6, h: 10 }]));
    expect(loadLayout()).toEqual(DEFAULT_LAYOUT);
  });
});
