import type { ReactorSheetAppProps } from "./types/types";
import "./styles/vellum/fonts.css";
import "./styles/vellum/tokens.css";
import "./styles/vellum/components.css";
import "./styles/styles.scss";
import { Layout } from "./components/Layout";
import ReactorSheetProvider from "./components/ReactorSheetProvider";
import Nav from "./components/Nav";
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
    <div className="reactor-sheet-app" ref={appRef}>
      <ReactorSheetProvider
        initialActor={actor!}
        source={source!}
        contextConnector={contextConnector}
      >
        <Layout />
        <Nav />
      </ReactorSheetProvider>
    </div>
  );
}

export default ReactorSheetApp;
