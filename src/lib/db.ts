import { Dexie, type EntityTable } from "dexie";
import type { Task } from "../features/tasks/types";

export const db = new Dexie("planner") as Dexie & {
  tasks: EntityTable<Task, "id">;
};

// The schema lists the primary key and any indexes, not every field: Dexie
// stores whole objects. We only look tasks up by id for now and filter the
// rest in JavaScript. Adding an index later means adding db.version(2).
db.version(1).stores({
  tasks: "id",
});
