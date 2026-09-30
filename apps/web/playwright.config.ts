import { defineConfig, devices } from "@playwright/test";

// Os testes usam a IA e o executor de mentira (?ia=falso&executor=falso): o WebContainer de
// verdade precisa da rede do StackBlitz, e a IA de verdade, de uma chave. Os dois ficam para
// o teste manual (veja o README).
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4173", trace: "retain-on-failure" },
  webServer: {
    command: "pnpm exec vite build && pnpm exec vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
