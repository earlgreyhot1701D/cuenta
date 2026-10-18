// Job: configure Playwright for the judge-path test against a running app (local or production).
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 180_000,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    ...devices["Desktop Chrome"],
  },
});
