import { defineConfig, devices } from "@playwright/test";

// QA manuelle "comme un humain" sur une preview Vercel isolée (protégée par
// Vercel Authentication) -- cf. e2e/global-setup.ts pour le bypass.
const PREVIEW_URL = process.env.QA_BASE_URL ?? "https://folio-jkprqf3w4-enora-le-turnier-s-projects.vercel.app";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: PREVIEW_URL,
    storageState: "./e2e/.auth/vercel-bypass.json",
    video: "on",
    screenshot: "on",
    trace: "on",
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
