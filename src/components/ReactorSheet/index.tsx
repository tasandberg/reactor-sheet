import type { ReactorSheetAppProps } from "./types/types";
import ReactorSheetProvider from "./ReactorSheetProvider";
import Header from "./Header";
import "./styles/styles.scss";

function ReactorSheetApp({ actor, source }: ReactorSheetAppProps) {
  return (
    <ReactorSheetProvider actor={actor} source={source}>
      <div className="reactor-sheet-app">
        <Header />
      </div>
    </ReactorSheetProvider>
  );
}

export default ReactorSheetApp;
