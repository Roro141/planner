import { describe, expect, it } from "vitest";
import { fromRow, toRow, type TaskRow } from "./taskRows";

const row: TaskRow = {
  id: "a1",
  user_id: "u1",
  title: "essay",
  due_at: "2026-10-23T17:00:00+00:00",
  has_time: true,
  completed_at: null,
  created_at: "2026-10-19T09:30:15.123+00:00",
  updated_at: "2026-10-19T09:30:15.123+00:00",
  deleted_at: null,
};

describe("task rows", () => {
  it("converts database timestamps to the app's ISO format", () => {
    expect(fromRow(row)).toEqual({
      id: "a1",
      title: "essay",
      dueAt: "2026-10-23T17:00:00.000Z",
      hasTime: true,
      completedAt: null,
      createdAt: "2026-10-19T09:30:15.123Z",
      updatedAt: "2026-10-19T09:30:15.123Z",
      deletedAt: null,
    });
  });

  it("leaves user_id out when saving", () => {
    expect(toRow(fromRow(row))).not.toHaveProperty("user_id");
  });

  it("survives a round trip", () => {
    const task = fromRow(row);
    expect(fromRow(toRow(task))).toEqual(task);
  });
});
