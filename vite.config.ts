import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import foundryReact from "foundry-vtt-react/vite";
import svgr from "vite-plugin-svgr";
import path from "path";

// foundryReact() owns the Foundry-specific config (base, root, server.proxy,
// build input/output) — derived from module.json. Only app-specific config lives here.
export default defineConfig({
  plugins: [react(), foundryReact(), svgr()],
  define: {
    "process.env": {},
  },
  resolve: {
    // Note: react/react-dom dedupe is handled by foundryReact() — no need to set it here.
    alias: {
      // Allow absolute imports from the src directory
      "@src": path.resolve(__dirname, "src"),
    },
  },
  build: {
    sourcemap: true,
  },
  server: {
    open: true,
  },
});
