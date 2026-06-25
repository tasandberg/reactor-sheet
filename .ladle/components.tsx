import type { GlobalProvider } from "@ladle/react";
// Same CSS pipeline as the app: fonts → tokens → components → sheet base.
// Vite applies postcss.config.mjs (the Vellum scoper) to the vellum/* files.
import "../src/ReactorSheet/styles/vellum/fonts.css";
import "../src/ReactorSheet/styles/vellum/tokens.css";
import "../src/ReactorSheet/styles/vellum/components.css";
import "../src/ReactorSheet/styles/styles.scss";

export const Provider: GlobalProvider = ({ children }) => {
  // Append ?theme=cream to the Ladle URL to preview the cream theme.
  const cream =
    typeof location !== "undefined" &&
    new URLSearchParams(location.search).get("theme") === "cream";
  return (
    <div className="reactor-sheet" data-theme={cream ? "cream" : undefined}>
      {/* resize handle lets you drag-test the container-query reflow */}
      <div
        className="reactor-sheet-app"
        style={{ resize: "horizontal", overflow: "auto", width: 640, maxWidth: "100%", padding: 16 }}
      >
        {children}
      </div>
    </div>
  );
};
