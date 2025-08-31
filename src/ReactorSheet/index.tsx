import type { ReactorSheetAppProps } from "./types/types";
import "./styles/styles.scss";
import { Layout } from "./components/Layout";
import ReactorSheetProvider from "./components/ReactorSheetProvider";

function ReactorSheetApp({
  actor,
  source,
  contextConnector,
}: ReactorSheetAppProps) {
  return (
    <ReactorSheetProvider
      initialActor={actor!}
      source={source!}
      contextConnector={contextConnector}
    >
      <Layout />
    </ReactorSheetProvider>
  );
}

export default ReactorSheetApp;
