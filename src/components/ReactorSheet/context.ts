import { createContext, useContext } from "react";
import type { OSEActor } from "./types/types";

// Define the shape of your context value here
interface ReactorSheetContextValue {
  actor: OSEActor;
  source: OSEActor;
  enrichedContent: {
    notes?: string;
    biography?: string;
  };
}

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
