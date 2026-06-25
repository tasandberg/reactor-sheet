import { defineConfig } from "vite";
import path from "path";

// Dedicated Vite config for Ladle. Deliberately omits:
// - foundry-vtt-react's `foundryReact()` plugin (targets module.json, not valid for Ladle)
// - `@vitejs/plugin-react` and `vite-plugin-svgr` — both are peered with vite@8/rolldown
//   but Ladle runs on vite@6; passing vite8 plugins into vite6 causes
//   "Missing field moduleType" from the rolldown builtin:vite-react-refresh-wrapper plugin.
//   Ladle provides its own @vitejs/plugin-react-swc@3.x (vite6-compatible) by default.
// PostCSS config is picked up automatically from the project's postcss.config.mjs.
export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "src"),
    },
  },
});
