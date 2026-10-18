// Job: configure Vitest for the pure helper unit tests.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["tests/unit/**/*.test.ts"] },
  resolve: { alias: { "@": import.meta.dirname } },
});
