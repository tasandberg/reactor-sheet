export const THEMES = ["dark", "cream"] as const;
export type Theme = (typeof THEMES)[number];

export function resolveTheme(value: unknown): Theme {
  return value === "cream" ? "cream" : "dark";
}

/** Apply a theme to a sheet's root element. Dark = no attribute (token default). */
export function applyTheme(root: HTMLElement, theme: Theme): void {
  if (theme === "dark") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

// --- module-level theme store -------------------------------------------------
// Single source of truth, kept OUTSIDE React on purpose: the toggle flips the
// DOM attribute directly, so it never depends on context propagation, ref
// timing, or a re-render round-trip (all of which proved flaky in the Foundry
// mount). Persisted to localStorage; shared across any open sheets.
const KEY = "reactor-sheet:theme";

let current: Theme = (() => {
  try {
    return resolveTheme(localStorage.getItem(KEY));
  } catch {
    return "dark";
  }
})();

export function getTheme(): Theme {
  return current;
}

/** Apply the current theme to every mounted sheet root. */
export function applyThemeToAll(): void {
  if (typeof document === "undefined") return;
  document
    .querySelectorAll<HTMLElement>(".reactor-sheet-app")
    .forEach((el) => applyTheme(el, current));
}

/** Flip dark⇄cream, persist, and apply to the live DOM. */
export function toggleTheme(): void {
  current = current === "dark" ? "cream" : "dark";
  try {
    localStorage.setItem(KEY, current);
  } catch {
    /* storage unavailable — keep in-memory only */
  }
  applyThemeToAll();
}
