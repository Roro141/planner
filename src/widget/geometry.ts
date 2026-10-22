/**
 * Where the widget window goes. All values are physical pixels (what the
 * OS uses), with `scale` converting from the CSS sizes below.
 *
 * Closed, the window is just the bubble. Open, it grows into the card and
 * the bubble stays exactly where it was on screen: the card opens up or
 * down, left or right, whichever way has room.
 */

/** Window size when closed: the bubble plus room for its shadow. */
export const BUBBLE_SIZE = 64;
/** Window size when open (card, gap and bubble). */
export const OPEN_WIDTH = 340;
export const OPEN_HEIGHT = 560;

export type Point = { x: number; y: number };
export type Area = { x: number; y: number; width: number; height: number };

/** Which way the card opens from the bubble. */
export type Direction = { up: boolean; left: boolean };

/** Open toward the side of the screen with more room. */
export function directionFor(bubble: Point, scale: number, screen: Area): Direction {
  const size = BUBBLE_SIZE * scale;
  const centerX = bubble.x + size / 2;
  const centerY = bubble.y + size / 2;
  return {
    up: centerY > screen.y + screen.height / 2,
    left: centerX > screen.x + screen.width / 2,
  };
}

/** Top-left corner of the open window, so the bubble doesn't move. */
export function openPosition(bubble: Point, scale: number, direction: Direction): Point {
  const size = BUBBLE_SIZE * scale;
  return {
    x: direction.left ? bubble.x + size - OPEN_WIDTH * scale : bubble.x,
    y: direction.up ? bubble.y + size - OPEN_HEIGHT * scale : bubble.y,
  };
}

/** Keeps the bubble fully on screen (after a monitor change, say). */
export function clampToScreen(bubble: Point, scale: number, screen: Area): Point {
  const size = BUBBLE_SIZE * scale;
  return {
    x: Math.min(Math.max(bubble.x, screen.x), screen.x + screen.width - size),
    y: Math.min(Math.max(bubble.y, screen.y), screen.y + screen.height - size),
  };
}

/** The default spot: bottom-right corner, a little in from the edges. */
export function defaultPosition(scale: number, screen: Area): Point {
  const margin = 24 * scale;
  const size = BUBBLE_SIZE * scale;
  return {
    x: screen.x + screen.width - size - margin,
    y: screen.y + screen.height - size - margin,
  };
}
