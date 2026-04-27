import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — smoke test layer.
 *
 * Goals: catch the regressions that burn ship days. Boot, hub renders,
 * apartment loads, save round-trips, end screen triggers, corrupt save
 * shows recovery. ~30 seconds total runtime.
 *
 * webServer: auto-starts http-server before tests. CI uses the same path.
 */
export default defineConfig({
  testDir: './tests/smoke',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,           // smoke tests share localStorage state mental model
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  retries: process.env.CI ? 1 : 0,

  use: {
    baseURL: 'http://localhost:8000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 5_000,
    navigationTimeout: 10_000
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  webServer: {
    command: 'npx http-server -p 8000 -c-1 .',
    url: 'http://localhost:8000',
    timeout: 15_000,
    reuseExistingServer: !process.env.CI
  }
});
