import type { ReactorSheetAppProps } from "./types/types";
import "./styles/styles.scss";
import { Layout } from "./components/Layout";
import ReactorSheetProvider from "./components/ReactorSheetProvider";
import Nav from "./components/Nav";

function ReactorSheetApp({
  actor,
  source,
  contextConnector,
}: ReactorSheetAppProps) {
  return (
    <div className="reactor-sheet-app">
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
