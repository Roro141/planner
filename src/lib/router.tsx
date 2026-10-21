import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

/**
 * A tiny router: the page is picked from the URL path, links change it with
 * history.pushState, and the back button works through popstate. Four pages
 * don't need a routing library.
 */

const listeners = new Set<() => void>();

export function navigate(path: string) {
  if (path === window.location.pathname) return;
  window.history.pushState(null, "", path);
  listeners.forEach((listener) => listener());
  window.scrollTo(0, 0);
}

export function usePath() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    listeners.add(update);
    window.addEventListener("popstate", update);
    return () => {
      listeners.delete(update);
      window.removeEventListener("popstate", update);
    };
  }, []);

  return path;
}

type LinkProps = {
  to: string;
  className?: string;
  children: ReactNode;
  "aria-current"?: "page" | undefined;
};

/** A normal <a>, so ctrl/cmd-click still opens a new tab. */
export function Link({ to, children, ...rest }: LinkProps) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  }

  return (
    <a href={to} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}
