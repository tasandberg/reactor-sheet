import type { ReactorSheetAppProps } from "./types/types";
import ReactorSheetProvider from "./components/ReactorSheetProvider";
import "./styles/styles.scss";
import { Layout } from "./components/Layout";

function ReactorSheetApp({ actor, source }: ReactorSheetAppProps) {
  return (
    <ReactorSheetProvider initialActor={actor!} source={source!}>
      <Layout />
    </ReactorSheetProvider>
  );
}

export default ReactorSheetApp;
