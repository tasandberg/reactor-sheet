import { createContext, useContext } from "react";
import type { Theme } from "./theme";

export type ThemeCtx = { theme: Theme; toggle: () => void };

// Default is a no-op so presentational components (and Ladle stories) can call
// useTheme() without a provider; ThemeProvider overrides it at the app root.
export const ThemeContext = createContext<ThemeCtx>({ theme: "dark", toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);
