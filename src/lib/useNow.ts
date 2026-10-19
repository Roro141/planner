import { useEffect, useState } from "react";

/**
 * The current time, refreshed every minute and whenever the tab comes back
 * into view. Without this, a tab left open overnight would keep showing
 * yesterday's date and sections.
 */
export function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return now;
}
