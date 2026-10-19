import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

/**
 * The signed-in session: undefined while checking, null when signed out.
 * Supabase restores the session from localStorage on load and refreshes it
 * in the background; onAuthStateChange tells us whenever it changes.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  return session;
}
