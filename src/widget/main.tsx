import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/tokens.css";
import "../styles/base.css";
import "../features/auth/auth.css";
import "../features/tasks/tasks.css";
import "./widget.css";

const root = createRoot(document.getElementById("root")!);

// Imported dynamically, like the main app, so a setup problem (missing
// Supabase settings) shows a message instead of an empty window.
import("./Widget")
  .then(({ Widget }) => {
    root.render(
      <StrictMode>
        <Widget />
      </StrictMode>,
    );
  })
  .catch((error: unknown) => {
    root.render(
      <p className="widget-error">{error instanceof Error ? error.message : String(error)}</p>,
    );
  });
