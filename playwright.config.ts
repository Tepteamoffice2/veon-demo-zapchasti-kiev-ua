import { defineConfig } from "@playwright/test";

// e2e against the production build (npm run build first). Browser: installed Google Chrome (channel "chrome").
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:4322", channel: "chrome" },
  webServer: {
    command: "npx astro preview --port 4322 --host 127.0.0.1",
    url: "http://127.0.0.1:4322/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
