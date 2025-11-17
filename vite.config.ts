import type { UserConfig } from "vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import APP_INFO from "./module.json";

const APP_NAME = APP_INFO.id;

const config: UserConfig = {
  root: "src/",
  publicDir: path.resolve(__dirname, "public"),
  base: "/modules/" + APP_NAME + "/dist",
  server: {
    port: 30001,
    open: true,

    proxy: {
      [`^(?!/modules/${APP_NAME}/dist)`]: "http://localhost:30000/",
      "/socket.io": {
        target: "ws://localhost:30000",
        ws: true,
      },
    },
  },
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      // Allow absolute imports from the src directory
      "@src": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      name: APP_NAME,
      entry: path.resolve(__dirname, "src/main.ts"),
      formats: ["es"],
      fileName: "main",
    },
  },
};

export default defineConfig({
  plugins: [react(), svgr()],
  ...config,
});
