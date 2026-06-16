import { useCallback, useState, type ReactNode } from "react";
import { resolveTheme, type Theme } from "./theme";
import { ThemeContext } from "./theme-context";

const KEY = "reactor-sheet:theme";

function read(): Theme {
  try {
    return resolveTheme(localStorage.getItem(KEY));
  } catch {
    return "dark";
  }
}

/** Holds theme state for the sheet and exposes it via ThemeContext. The chosen
 *  theme is applied as `data-theme` on the app root in index.tsx (dark = no attr,
 *  per theme.ts convention) and persisted to localStorage. */
export function ThemeProvider({ children }: { children: (theme: Theme) => ReactNode }) {
  const [theme, setTheme] = useState<Theme>(read);
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === "dark" ? "cream" : "dark";
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* storage unavailable — keep in-memory only */
      }
      return next;
    });
  }, []);
  return <ThemeContext.Provider value={{ theme, toggle }}>{children(theme)}</ThemeContext.Provider>;
}
