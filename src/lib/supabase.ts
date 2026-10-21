import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing Supabase settings (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY). " +
      "Locally: copy .env.example to .env.local, fill it in and restart the dev server. " +
      "On Vercel: add both under Settings → Environment Variables, then redeploy.",
  );
}

/** The one Supabase client for the whole app. It keeps the sign-in session in localStorage. */
export const supabase = createClient(url, key);
