import { SignIn } from "./features/auth/SignIn";
import { useSession } from "./features/auth/useSession";
import { Shell } from "./app/Shell";
import { FocusTimerProvider } from "./features/focus/FocusTimer";
import "./features/auth/auth.css";

export default function App() {
  const session = useSession();

  // Still checking for a saved session: show nothing rather than flashing
  // the sign-in page at someone who is already signed in.
  if (session === undefined) return null;
  if (session === null) return <SignIn />;

  // key: if a different account signs in, start the page fresh. The focus
  // timer sits outside the pages so it keeps running while you switch.
  return (
    <FocusTimerProvider key={session.user.id} userId={session.user.id}>
      <Shell userId={session.user.id} />
    </FocusTimerProvider>
  );
}
