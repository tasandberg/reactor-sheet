import { defineConfig, devices } from "@playwright/test";

// Foundry serves one world per license, and the seeded actor is shared mutable
// state — so run serially with a single worker. The CI workflow boots Foundry and
// activates the world before invoking `playwright test`; globalSetup only joins
// and seeds the fixture actor.
const BASE_URL = process.env.FOUNDRY_URL || "http://localhost:30000";

export default defineConfig({
  testDir: "./specs",
  globalSetup: "./global-setup.ts",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    headless: true,
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 15_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Software WebGL so the headless canvas boots (Foundry needs a WebGL context).
    launchOptions: { args: ["--enable-unsafe-swiftshader"] },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
