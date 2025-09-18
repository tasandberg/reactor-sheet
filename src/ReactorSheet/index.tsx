import type { ReactorSheetAppProps } from "./types/types";
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
    if (appRef.current) {
      // Prevent crazy event propagation in foundry
      appRef.current.addEventListener("mousedown", (event) => {
        event.stopPropagation();
      });
    }
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
