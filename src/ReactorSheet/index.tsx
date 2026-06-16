import type { ReactorSheetAppProps } from "./types/types";
import "./styles/vellum/fonts.css";
import "./styles/vellum/tokens.css";
import "./styles/vellum/components.css";
import "./styles/styles.scss";
import ReactorSheetProvider from "./components/ReactorSheetProvider";
import SheetShell from "./components/SheetShell";
import { ThemeProvider } from "./ThemeProvider";
import { useEffect, useRef } from "react";

function ReactorSheetApp({
  actor,
  source,
  contextConnector,
}: ReactorSheetAppProps) {
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function stopPropagation(event: MouseEvent) {
      event.stopPropagation();
    }
    let appRefCurrent: HTMLDivElement | null = null;
    if (appRef.current) {
      // Prevent crazy event propagation in foundry
      appRefCurrent = appRef.current;
      appRefCurrent.addEventListener("mousedown", stopPropagation);
    }

    return () => {
      if (appRefCurrent) {
        appRefCurrent.removeEventListener("mousedown", stopPropagation);
      }
    };
  }, [appRef]);

  return (
    <ThemeProvider>
      {(theme) => (
        <div className="reactor-sheet-app" data-theme={theme === "dark" ? undefined : theme} ref={appRef}>
          <ReactorSheetProvider
            initialActor={actor!}
            source={source!}
            contextConnector={contextConnector}
          >
            <SheetShell />
          </ReactorSheetProvider>
        </div>
      )}
    </ThemeProvider>
  );
}

export default ReactorSheetApp;
