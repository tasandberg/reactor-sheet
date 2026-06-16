import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// Dedicated Vite config for Ladle. It deliberately omits foundry-vtt-react's
// `foundryReact()` plugin — that plugin derives the build root/input from
// module.json (the Foundry module entry), which has no meaning in the Ladle
// workbench and breaks Ladle's own app entry resolution. Ladle only needs
// React, SVGR, and the @src alias; the Vellum PostCSS scoper is picked up from
// the project's postcss.config.mjs automatically.
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "src"),
    },
  },
});
