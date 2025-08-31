import { createContext, useContext } from "react";
import type { ReactorSheetContextValue } from "../types/types";

export const ReactorSheetContext = createContext<ReactorSheetContextValue>(
  null!
);

export function useReactorSheetContext() {
  const context = useContext(ReactorSheetContext);
  if (!context) {
    throw new Error(
      "useReactorSheetContext must be used within a ReactorSheetProvider"
    );
  }
  return context;
}
