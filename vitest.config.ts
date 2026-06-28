import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "src"),
      "@app": path.resolve(__dirname, "src/ReactorSheet/app"),
      "@layout": path.resolve(__dirname, "src/ReactorSheet/layout"),
      "@features": path.resolve(__dirname, "src/ReactorSheet/features"),
      "@domain": path.resolve(__dirname, "src/ReactorSheet/domain"),
      "@ui": path.resolve(__dirname, "src/ReactorSheet/components/ui"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "tools/**/*.test.ts"],
  },
});
