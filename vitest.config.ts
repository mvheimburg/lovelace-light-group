import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  optimizeDeps: {
    include: ["lit", "lit/directives/live.js", "lit/directives/if-defined.js",
      "lit/directives/class-map.js",
      "lit/directives/style-map.js"],
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      headless: true,
    },
  },
});
