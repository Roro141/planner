import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

/**
 * Whether this device gets reminders, and turning them on and off.
 *
 * Turning on asks for notification permission, subscribes this browser to
 * push messages, and saves the subscription in push_subscriptions. The
 * send-reminders server function then sends a push to every saved
 * subscription when a timed task is due.
 */

export type ReminderStatus =
  | "checking"
  /** This browser can't do push notifications at all. */
  | "unsupported"
  /** iPhone/iPad: only works from the home screen app. */
  | "install-first"
  /** VITE_VAPID_PUBLIC_KEY isn't set, so push can't be set up yet. */
  | "not-configured"
  | "denied"
  | "off"
  | "on";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** The VAPID public key is base64url text; the push API wants raw bytes. */
function keyToBytes(key: string) {
  const padded = (key + "=".repeat((4 - (key.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function currentSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export function useReminders() {
  const [status, setStatus] = useState<ReminderStatus>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check(): Promise<ReminderStatus> {
      const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!supported) return isIos() && !isStandalone() ? "install-first" : "unsupported";
      if (!VAPID_PUBLIC_KEY) return "not-configured";
      if (Notification.permission === "denied") return "denied";
      return (await currentSubscription()) ? "on" : "off";
    }

    check().then((result) => !cancelled && setStatus(result));
    return () => {
      cancelled = true;
    };
  }, []);

  async function turnOn() {
    if (!VAPID_PUBLIC_KEY) return;
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyToBytes(VAPID_PUBLIC_KEY),
        }));
      const json = subscription.toJSON();
      const { error } = await supabase.from("push_subscriptions").upsert(
        { endpoint: subscription.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth },
        { onConflict: "endpoint" },
      );
      if (error) throw error;
      setStatus("on");
    } catch {
      setError("Couldn't turn on reminders. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    setError(null);
    try {
      const subscription = await currentSubscription();
      if (subscription) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus("off");
    } catch {
      setError("Couldn't turn off reminders. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return { status, busy, error, turnOn, turnOff };
}
