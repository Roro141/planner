import { isTauri } from "@tauri-apps/api/core";
import { currentMonitor, getCurrentWindow, LogicalSize, PhysicalPosition, primaryMonitor } from "@tauri-apps/api/window";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BUBBLE_SIZE,
  clampToScreen,
  defaultPosition,
  directionFor,
  OPEN_HEIGHT,
  OPEN_WIDTH,
  openPosition,
  type Area,
  type Direction,
  type Point,
} from "./geometry";

const POSITION_KEY = "planner.widget.position";

function loadPosition(): Point | null {
  try {
    const saved = JSON.parse(localStorage.getItem(POSITION_KEY) ?? "null");
    return saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) ? saved : null;
  } catch {
    return null;
  }
}

function savePosition(point: Point) {
  try {
    localStorage.setItem(POSITION_KEY, JSON.stringify(point));
  } catch {
    // Not remembered; it starts in the corner next time.
  }
}

async function screenInfo(): Promise<{ scale: number; screen: Area }> {
  const monitor = (await currentMonitor()) ?? (await primaryMonitor());
  const scale = monitor?.scaleFactor ?? (await getCurrentWindow().scaleFactor());
  const area = monitor?.workArea;
  const screen = area
    ? { x: area.position.x, y: area.position.y, width: area.size.width, height: area.size.height }
    : { x: 0, y: 0, width: 1920 * scale, height: 1040 * scale };
  return { scale, screen };
}

/**
 * Controls the widget's window: a bubble when closed, the card when open.
 * Outside the desktop app (a normal browser tab, for previews) it only
 * switches between open and closed, without moving anything.
 */
export function useWidgetWindow() {
  const desktop = isTauri();
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<Direction>({ up: true, left: true });

  // Refs, because the window event handlers outlive any one render.
  const isOpen = useRef(false);
  // Where the bubble sits on screen (top-left, physical pixels).
  const bubble = useRef<Point | null>(null);
  // True while the app itself is moving the window, so those moves aren't
  // mistaken for the bubble being dragged somewhere new.
  const moving = useRef(false);

  // On start: put the bubble where it was last time (or the corner), then show it.
  useEffect(() => {
    if (!desktop) return;
    (async () => {
      const win = getCurrentWindow();
      const { scale, screen } = await screenInfo();
      const spot = clampToScreen(loadPosition() ?? defaultPosition(scale, screen), scale, screen);
      bubble.current = spot;
      moving.current = true;
      await win.setSize(new LogicalSize(BUBBLE_SIZE, BUBBLE_SIZE));
      await win.setPosition(new PhysicalPosition(spot.x, spot.y));
      await win.show();
      setTimeout(() => (moving.current = false), 150);
    })();
  }, [desktop]);

  const close = useCallback(async () => {
    if (!isOpen.current) return;
    isOpen.current = false;
    setOpen(false);
    if (!desktop || !bubble.current) return;
    const win = getCurrentWindow();
    moving.current = true;
    await win.setSize(new LogicalSize(BUBBLE_SIZE, BUBBLE_SIZE));
    await win.setPosition(new PhysicalPosition(bubble.current.x, bubble.current.y));
    setTimeout(() => (moving.current = false), 150);
  }, [desktop]);

  const openCard = useCallback(async () => {
    if (isOpen.current) return;
    isOpen.current = true;
    if (!desktop || !bubble.current) {
      setOpen(true);
      return;
    }
    const win = getCurrentWindow();
    const { scale, screen } = await screenInfo();
    const dir = directionFor(bubble.current, scale, screen);
    const spot = openPosition(bubble.current, scale, dir);
    setDirection(dir);
    setOpen(true);
    moving.current = true;
    await win.setPosition(new PhysicalPosition(spot.x, spot.y));
    await win.setSize(new LogicalSize(OPEN_WIDTH, OPEN_HEIGHT));
    await win.setFocus();
    setTimeout(() => (moving.current = false), 150);
  }, [desktop]);

  const toggle = useCallback(() => (isOpen.current ? close() : openCard()), [close, openCard]);

  /** Called once the pointer has moved a few pixels on the bubble: let the OS drag the window. */
  const startDrag = useCallback(() => {
    if (desktop && !isOpen.current) void getCurrentWindow().startDragging();
  }, [desktop]);

  // Remember where the bubble was dragged to; close when you click elsewhere.
  useEffect(() => {
    if (!desktop) return;
    const win = getCurrentWindow();
    const unlisten = [
      win.onMoved(({ payload }) => {
        if (isOpen.current || moving.current) return;
        bubble.current = { x: payload.x, y: payload.y };
        savePosition(bubble.current);
      }),
      win.onFocusChanged(({ payload: focused }) => {
        if (!focused) void close();
      }),
    ];
    return () => unlisten.forEach((p) => p.then((stop) => stop()));
  }, [desktop, close]);

  // Esc closes the card.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      // Quick add uses Esc to clear its text first (and says so with preventDefault).
      if (event.key === "Escape" && !event.defaultPrevented) void close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return { desktop, open, direction, toggle, close, startDrag };
}
