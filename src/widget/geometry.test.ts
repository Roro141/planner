import { describe, expect, it } from "vitest";
import { clampToScreen, defaultPosition, directionFor, OPEN_HEIGHT, OPEN_WIDTH, openPosition } from "./geometry";

// A 1920×1040 work area (taskbar at the bottom), 125% scaling.
const SCREEN = { x: 0, y: 0, width: 1920, height: 1040 };
const SCALE = 1.25;
const BUBBLE = 64 * SCALE; // 80 physical px

describe("widget geometry", () => {
  it("starts in the bottom-right corner", () => {
    expect(defaultPosition(SCALE, SCREEN)).toEqual({ x: 1920 - BUBBLE - 30, y: 1040 - BUBBLE - 30 });
  });

  it("opens up and to the left from the bottom-right, keeping the bubble in place", () => {
    const bubble = defaultPosition(SCALE, SCREEN);
    const direction = directionFor(bubble, SCALE, SCREEN);
    expect(direction).toEqual({ up: true, left: true });
    const open = openPosition(bubble, SCALE, direction);
    // The open window's bottom-right corner is the bubble's bottom-right corner.
    expect(open.x + OPEN_WIDTH * SCALE).toBe(bubble.x + BUBBLE);
    expect(open.y + OPEN_HEIGHT * SCALE).toBe(bubble.y + BUBBLE);
  });

  it("opens down and to the right from the top-left", () => {
    const bubble = { x: 20, y: 20 };
    const direction = directionFor(bubble, SCALE, SCREEN);
    expect(direction).toEqual({ up: false, left: false });
    expect(openPosition(bubble, SCALE, direction)).toEqual(bubble);
  });

  it("pulls a bubble that's off screen back onto it", () => {
    expect(clampToScreen({ x: 2500, y: -40 }, SCALE, SCREEN)).toEqual({ x: 1920 - BUBBLE, y: 0 });
  });
});
