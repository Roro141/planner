import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing Supabase settings. Copy .env.example to .env.local, fill in your " +
      "project's URL and publishable key, then restart the dev server.",
  );
}

/** The one Supabase client for the whole app. It keeps the sign-in session in localStorage. */
export const supabase = createClient(url, key);
