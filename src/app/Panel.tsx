import type { ReactNode } from "react";
import { Link } from "../lib/router";
import type { SectionPath } from "./Nav";

type Props = {
  /** The section's own tab, opened by the "bigger" button. */
  path: SectionPath;
  label: string;
  /** On the dashboard (small, with a button to open it) or opened on its own. */
  expanded: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * One section of the dashboard, like a card pinned to a board. The corner
 * button opens it on its own, full size; when it's open, the button goes
 * back to the dashboard. On the dashboard, the grip next to it moves the
 * card (see Dashboard).
 */
export function Panel({ path, label, expanded, className, children }: Props) {
  const classes = ["panel", expanded ? "panel--expanded" : "panel--compact", className];

  return (
    <section className={classes.filter(Boolean).join(" ")} aria-label={label}>
      {!expanded && (
        <span className="panel__grip" title="Drag to move" aria-hidden="true">
          ⠿
        </span>
      )}
      <Link
        to={expanded ? "/" : path}
        className="panel__toggle"
        aria-label={expanded ? "Back to the dashboard" : `Open ${label} bigger`}
      >
        <span aria-hidden="true">{expanded ? "⤡" : "⤢"}</span>
      </Link>
      {children}
    </section>
  );
}
