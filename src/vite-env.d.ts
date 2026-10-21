/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string | undefined;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string | undefined;
  /** Public half of the notification key pair; reminders stay hidden without it. */
  readonly VITE_VAPID_PUBLIC_KEY: string | undefined;
}
