import { useReminders } from "./useReminders";

/** A quiet line in the footer: turn reminders on or off for this device. */
export function ReminderToggle() {
  const { status, busy, error, turnOn, turnOff } = useReminders();

  let content: React.ReactNode = null;
  switch (status) {
    case "on":
      content = (
        <>
          reminders are on for this device ·{" "}
          <button type="button" className="footer-link" onClick={turnOff} disabled={busy}>
            turn off
          </button>
        </>
      );
      break;
    case "off":
      content = (
        <button type="button" className="footer-link" onClick={turnOn} disabled={busy}>
          {busy ? "one moment…" : "turn on reminders"}
        </button>
      );
      break;
    case "install-first":
      content = "for reminders, add this site to your home screen and open it from there.";
      break;
    case "denied":
      content = "notifications are blocked for this site in your settings.";
      break;
    // checking, unsupported, not-configured: say nothing.
  }

  if (!content) return null;
  return (
    <p className="footer-note">
      {content}
      {error && (
        <span className="page-error" role="alert">
          {" "}
          {error}
        </span>
      )}
    </p>
  );
}
