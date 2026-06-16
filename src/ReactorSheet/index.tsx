import type { ReactorSheetAppProps } from "./types/types";
import "./styles/vellum/fonts.css";
import "./styles/vellum/tokens.css";
import "./styles/vellum/components.css";
import "./styles/styles.scss";
import ReactorSheetProvider from "./components/ReactorSheetProvider";
import SheetShell from "./components/SheetShell";
import { applyTheme, getTheme } from "./theme";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

/** App root element. Applies the persisted theme before paint, and stops
 *  mousedown bubbling into Foundry. Theme changes after mount are driven
 *  directly by toggleTheme() (see theme.ts), not React state. */
function ThemedRoot({ children }: { children: ReactNode }) {
  const appRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (appRef.current) applyTheme(appRef.current, getTheme());
  }, []);

  useEffect(() => {
    const el = appRef.current;
    if (!el) return;
    // Prevent crazy event propagation in foundry
    const stopPropagation = (event: MouseEvent) => event.stopPropagation();
    el.addEventListener("mousedown", stopPropagation);
    return () => el.removeEventListener("mousedown", stopPropagation);
  }, []);

  return (
    <div className="reactor-sheet-app" ref={appRef}>
      {children}
    </div>
  );
}

function ReactorSheetApp({
  actor,
  source,
  contextConnector,
}: ReactorSheetAppProps) {
  return (
    <ThemedRoot>
      <ReactorSheetProvider
        initialActor={actor!}
        source={source!}
        contextConnector={contextConnector}
      >
        <SheetShell />
      </ReactorSheetProvider>
    </ThemedRoot>
  );
}

export default ReactorSheetApp;
