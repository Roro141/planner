import { Link } from "../../lib/router";
import { useFocusTimer, useTicker } from "./FocusTimer";
import { formatClock, KIND_LABELS, timeLeft } from "./timer";

/** A small running clock in the navigation, shown on other pages while a session is going. */
export function NavTimer() {
  const { state } = useFocusTimer();
  const tick = useTicker(state.status === "running");
  if (state.status === "idle") return null;

  return (
    <Link to="/focus" className="nav__timer">
      <span className="nav__timer-dot" aria-hidden="true" />
      {formatClock(timeLeft(state, tick))}
      <span className="visually-hidden">
        {" "}
        {KIND_LABELS[state.kind]} {state.status === "paused" ? "paused" : "left"}
      </span>
    </Link>
  );
}
