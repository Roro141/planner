import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/page.css";

const root = createRoot(document.getElementById("root")!);

// The app is imported dynamically so that a setup problem (like missing
// Supabase settings, which throws while the module loads) shows a message
// on the page instead of leaving it blank.
import("./App")
  .then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((error: unknown) => {
    root.render(
      <main className="page">
        <p className="page-header__note">something's not set up</p>
        <p className="page-error">{error instanceof Error ? error.message : String(error)}</p>
      </main>,
    );
  });
