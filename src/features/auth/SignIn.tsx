import { useState } from "react";
import { supabase } from "../../lib/supabase";

/**
 * Email and password sign-in. There's no sign-up: the one account is created
 * in the Supabase dashboard, and sign-ups are turned off there. Each device
 * stays signed in until you sign out.
 */
export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    // On success, useSession hears about the new session and the app appears.
    if (error) setError(error.message);
  }

  return (
    <main className="page sign-in">
      <p className="page-header__note">hello again</p>
      <h1 className="sign-in__title">Sign in to your planner</h1>

      <form
        className="sign-in__form"
        onSubmit={(event) => {
          event.preventDefault();
          signIn();
        }}
      >
        <label className="sign-in__label" htmlFor="sign-in-email">
          Email
        </label>
        <input
          id="sign-in-email"
          className="sign-in__input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoFocus
        />

        <label className="sign-in__label" htmlFor="sign-in-password">
          Password
        </label>
        <input
          id="sign-in-password"
          className="sign-in__input"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button className="sign-in__button" type="submit" disabled={busy}>
          {busy ? "One moment…" : "Sign in"}
        </button>
      </form>

      {error && (
        <p className="sign-in__error" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
