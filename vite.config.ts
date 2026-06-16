import { defineConfig, mergeConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import foundryReact from "foundry-vtt-react/vite";
import svgr from "vite-plugin-svgr";
import fs from "node:fs";
import path from "path";

// foundryReact() owns the Foundry-specific config (base, root, server.proxy,
// build input/output) — derived from module.json. Only app-specific config lives here.
const config: UserConfig = {
  // FOUNDRY_URL lets a cloud/devcontainer point Vite at Foundry on another host
  // (e.g. the compose service `foundry`). Unset → plugin default http://localhost:30000.
  plugins: [react(), foundryReact({ foundryUrl: process.env.FOUNDRY_URL }), svgr()],
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
};

// Uncommitted local overrides (gitignored). Drop a partial Vite config in
// vite.config.local.json — e.g. {"server":{"allowedHosts":["foo.ngrok-free.app"]}} —
// and it's deep-merged on top. Arrays (like allowedHosts) are concatenated.
const localPath = path.resolve(__dirname, "vite.config.local.json");
const local: UserConfig = fs.existsSync(localPath)
  ? (JSON.parse(fs.readFileSync(localPath, "utf8")) as UserConfig)
  : {};

export default defineConfig(mergeConfig(config, local));
