/**
 * Shows a notification from the page itself (not a push from the server).
 * Goes through the service worker when there is one, because iPhone home
 * screen apps only support notifications that way.
 */
export async function showLocalNotification(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification(title, { body, icon: "/icon-192.png", tag: "focus" });
      return;
    }
    new Notification(title, { body, icon: "/icon-192.png", tag: "focus" });
  } catch {
    // Notifications are a nice extra; the chime and the page still show it.
  }
}

/** Asks for permission once, from a click. Does nothing if already decided. */
export function askForNotifications() {
  if ("Notification" in window && Notification.permission === "default") {
    void Notification.requestPermission();
  }
}
