import { Link } from "../lib/router";

export const PAGES = [
  { path: "/", label: "today" },
  { path: "/week", label: "week" },
  { path: "/focus", label: "focus" },
  { path: "/review", label: "review" },
] as const;

export type PagePath = (typeof PAGES)[number]["path"];

/** Unknown paths fall back to Today. */
export function pageFor(path: string): PagePath {
  return PAGES.find((page) => page.path === path)?.path ?? "/";
}

export function Nav({ current, extra }: { current: PagePath; extra?: React.ReactNode }) {
  return (
    <nav className="nav" aria-label="Pages">
      <ul className="nav__list">
        {PAGES.map((page) => (
          <li key={page.path}>
            <Link
              to={page.path}
              className="nav__link"
              aria-current={page.path === current ? "page" : undefined}
            >
              {page.label}
            </Link>
          </li>
        ))}
      </ul>
      {extra}
    </nav>
  );
}
