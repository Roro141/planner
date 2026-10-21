/**
 * The Pomodoro timer as plain data and functions, so the rules can be tested
 * without React or a real clock. Times are milliseconds since 1970
 * (Date.now()), which keeps working when the phone sleeps or the tab is in
 * the background: the remaining time is always worked out from `endsAt`.
 */

export type SessionKind = "focus" | "short_break" | "long_break";

export const DURATIONS: Record<SessionKind, number> = {
  focus: 25 * 60_000,
  short_break: 5 * 60_000,
  long_break: 15 * 60_000,
};

/** A long break comes after this many focus sessions. */
export const FOCUS_PER_LONG_BREAK = 4;

export type TimerState = {
  kind: SessionKind;
  /** idle: not started yet. paused: started, then paused. */
  status: "idle" | "running" | "paused";
  /** When the running session will end. Null unless running. */
  endsAt: number | null;
  /** Time left while idle or paused. */
  remaining: number;
  /** Id for the session being timed, so it's saved exactly once. */
  sessionId: string | null;
  /** When this session was first started, as an ISO string. */
  startedAt: string | null;
  /** Focus sessions finished since the last long break. */
  focusDone: number;
  taskId: string | null;
};

/** A finished session, ready to be saved. */
export type FinishedSession = {
  id: string;
  kind: SessionKind;
  taskId: string | null;
  startedAt: string;
  endedAt: string;
};

export const initialTimer: TimerState = {
  kind: "focus",
  status: "idle",
  endsAt: null,
  remaining: DURATIONS.focus,
  sessionId: null,
  startedAt: null,
  focusDone: 0,
  taskId: null,
};

export function timeLeft(state: TimerState, now: number) {
  if (state.status === "running" && state.endsAt !== null) return Math.max(0, state.endsAt - now);
  return state.remaining;
}

export function isFinished(state: TimerState, now: number) {
  return state.status === "running" && state.endsAt !== null && now >= state.endsAt;
}

export function start(state: TimerState, now: number, newId: () => string): TimerState {
  if (state.status === "running") return state;
  return {
    ...state,
    status: "running",
    endsAt: now + state.remaining,
    sessionId: state.sessionId ?? newId(),
    startedAt: state.startedAt ?? new Date(now).toISOString(),
  };
}

export function pause(state: TimerState, now: number): TimerState {
  if (state.status !== "running") return state;
  return { ...state, status: "paused", endsAt: null, remaining: timeLeft(state, now) };
}

/** Back to the start of the current session, without saving it. */
export function reset(state: TimerState): TimerState {
  return { ...state, status: "idle", endsAt: null, remaining: DURATIONS[state.kind], sessionId: null, startedAt: null };
}

function moveTo(state: TimerState, kind: SessionKind, focusDone: number): TimerState {
  return {
    ...state,
    kind,
    focusDone,
    status: "idle",
    endsAt: null,
    remaining: DURATIONS[kind],
    sessionId: null,
    startedAt: null,
  };
}

/** What comes after a session: a break after focus (long every fourth), focus after a break. */
function after(state: TimerState) {
  if (state.kind !== "focus") {
    return { kind: "focus" as const, focusDone: state.kind === "long_break" ? 0 : state.focusDone };
  }
  const focusDone = state.focusDone + 1;
  return {
    kind: focusDone >= FOCUS_PER_LONG_BREAK ? ("long_break" as const) : ("short_break" as const),
    focusDone,
  };
}

/** Jump to the next session without saving this one. */
export function skip(state: TimerState): TimerState {
  const next = after(state);
  return moveTo(state, next.kind, next.focusDone);
}

/**
 * The session ran out. Returns what to save and the next (idle) state. The
 * end time is when it was due to end, not when the app noticed, so a session
 * that ended while the laptop was asleep is still recorded correctly. The
 * start is the end minus the session's length, so time spent paused isn't
 * counted as focus.
 */
export function finish(state: TimerState): { session: FinishedSession | null; next: TimerState } {
  const next = after(state);
  const session =
    state.sessionId && state.startedAt && state.endsAt !== null
      ? {
          id: state.sessionId,
          kind: state.kind,
          taskId: state.taskId,
          startedAt: new Date(state.endsAt - DURATIONS[state.kind]).toISOString(),
          endedAt: new Date(state.endsAt).toISOString(),
        }
      : null;
  return { session, next: moveTo(state, next.kind, next.focusDone) };
}

/** "25:00", "4:07". */
export function formatClock(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** "45 min", "1 h 15 min". */
export function formatDuration(ms: number) {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export const KIND_LABELS: Record<SessionKind, string> = {
  focus: "focus",
  short_break: "short break",
  long_break: "long break",
};
