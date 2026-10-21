import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { FinishedSession, SessionKind } from "./timer";

/** A saved focus or break session, as the app uses it. */
export type FocusSession = {
  id: string;
  kind: SessionKind;
  taskId: string | null;
  startedAt: string;
  endedAt: string;
};

type SessionRow = {
  id: string;
  kind: SessionKind;
  task_id: string | null;
  started_at: string;
  ended_at: string;
};

const SAVED_EVENT = "focus-session-saved";

/**
 * Saves a finished session. It's an upsert on the session's id, so two open
 * tabs finishing the same session can't record it twice.
 */
export async function saveSession(session: FinishedSession) {
  const { error } = await supabase.from("focus_sessions").upsert({
    id: session.id,
    kind: session.kind,
    task_id: session.taskId,
    started_at: session.startedAt,
    ended_at: session.endedAt,
  });
  if (!error) window.dispatchEvent(new Event(SAVED_EVENT));
  return !error;
}

function fromRow(row: SessionRow): FocusSession {
  return {
    id: row.id,
    kind: row.kind,
    taskId: row.task_id,
    startedAt: new Date(row.started_at).toISOString(),
    endedAt: new Date(row.ended_at).toISOString(),
  };
}

/** Sessions that ended between `from` and `to` (ISO strings). Reloads when a new one is saved. */
export function useFocusSessions(from: string, to: string) {
  const [sessions, setSessions] = useState<FocusSession[] | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("focus_sessions")
        .select()
        .gte("ended_at", from)
        .lt("ended_at", to)
        .order("ended_at");
      if (cancelled) return;
      // A failed load shows as no sessions rather than breaking the page.
      setSessions(error ? [] : (data as SessionRow[]).map(fromRow));
    }

    load();
    window.addEventListener(SAVED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(SAVED_EVENT, load);
    };
  }, [from, to]);

  return sessions;
}

/** Total focus time (breaks not counted) in milliseconds. */
export function focusTime(sessions: FocusSession[]) {
  return sessions
    .filter((s) => s.kind === "focus")
    .reduce((total, s) => total + (Date.parse(s.endedAt) - Date.parse(s.startedAt)), 0);
}
