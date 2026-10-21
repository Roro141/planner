import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { askForNotifications, showLocalNotification } from "../../lib/notify";
import { playChime, unlockChime } from "./chime";
import { saveSession } from "./sessions";
import {
  finish,
  formatClock,
  initialTimer,
  isFinished,
  KIND_LABELS,
  pause,
  reset,
  skip,
  start,
  timeLeft,
  type TimerState,
} from "./timer";

// One saved timer per account, so a running timer (and its task) never
// carries over to someone else signing in on the same browser.
const storageKey = (userId: string) => `planner.focus-timer.${userId}`;

function load(key: string): TimerState {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return { ...initialTimer, ...JSON.parse(saved) };
  } catch {
    // Private mode or corrupt data: start fresh.
  }
  return initialTimer;
}

type FocusTimer = {
  state: TimerState;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  setTask: (taskId: string | null) => void;
  /** Set when a finished session couldn't be saved. */
  saveError: boolean;
};

const Context = createContext<FocusTimer | null>(null);

export function useFocusTimer() {
  const timer = useContext(Context);
  if (!timer) throw new Error("useFocusTimer must be used inside FocusTimerProvider");
  return timer;
}

/** Re-renders the calling component every second while `active`. */
export function useTicker(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

const DONE_MESSAGES = {
  focus: ["Focus session done", "Time for a break."],
  short_break: ["Break's over", "Ready for another focus session?"],
  long_break: ["Long break's over", "Ready when you are."],
} as const;

/**
 * Holds the timer for the whole app, so it keeps running while you look at
 * other pages. The state is kept in localStorage: a reload, or closing the
 * tab and coming back later, picks up where it was.
 */
export function FocusTimerProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const key = storageKey(userId);
  const [state, setState] = useState<TimerState>(() => load(key));
  const [saveError, setSaveError] = useState(false);
  // Sessions already handled, so a finish noticed twice (timer and tab
  // focus at the same moment) only chimes and saves once.
  const handled = useRef(new Set<string>());

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Not saved; the timer still works for this visit.
    }
  }, [key, state]);

  // Another tab changed the timer: follow it.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === key) setState(load(key));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  // Notice when the running session ends: a timeout for when it's due, plus
  // a check whenever the tab comes back (timeouts are delayed in the
  // background and stop while a laptop sleeps).
  useEffect(() => {
    if (state.status !== "running" || state.endsAt === null) return;

    function check() {
      if (!isFinished(state, Date.now())) return;
      const { session, next } = finish(state);
      setState(next);
      if (!session || handled.current.has(session.id)) return;
      handled.current.add(session.id);
      playChime();
      const [title, body] = DONE_MESSAGES[session.kind];
      if (document.visibilityState !== "visible") void showLocalNotification(title, body);
      void saveSession(session).then((ok) => setSaveError(!ok));
    }

    const timer = setTimeout(check, Math.max(0, state.endsAt - Date.now()) + 50);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [state]);

  // The tab title shows the time left, so it's visible from other tabs.
  useEffect(() => {
    const original = "Planner";
    if (state.status !== "running") {
      document.title = state.status === "paused" ? `paused · ${original}` : original;
      return;
    }
    const update = () =>
      (document.title = `${formatClock(timeLeft(state, Date.now()))} ${KIND_LABELS[state.kind]} · ${original}`);
    update();
    const timer = setInterval(update, 1000);
    return () => {
      clearInterval(timer);
      document.title = original;
    };
  }, [state]);

  const timer: FocusTimer = {
    state,
    start: () => {
      unlockChime();
      askForNotifications();
      setState((s) => start(s, Date.now(), () => crypto.randomUUID()));
    },
    pause: () => setState((s) => pause(s, Date.now())),
    reset: () => setState(reset),
    skip: () => setState(skip),
    setTask: (taskId) => setState((s) => ({ ...s, taskId })),
    saveError,
  };

  return <Context.Provider value={timer}>{children}</Context.Provider>;
}
