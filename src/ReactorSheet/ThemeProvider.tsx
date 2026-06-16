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
 *  theme is applied to the app root with applyTheme() in index.tsx and persisted
 *  to localStorage. */
export function ThemeProvider({ children }: { children: ReactNode }) {
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
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
