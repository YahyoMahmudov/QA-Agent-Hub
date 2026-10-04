import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the real functional suite that backs the
 * "Run Full Suite" button in the QA Agent Hub UI. Targets the live
 * SauceDemo site (https://www.saucedemo.com) across its standard
 * test personas.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  retries: 0,
  workers: 4,
  // When the backend spawns a run (server/services/suite.service.ts) it sets
  // PW_STREAM_REPORTER=1 so results stream back as NDJSON over stdout instead
  // of only being written to disk at the end. Kept out of the CLI args so we
  // never have to shell-quote an absolute reporter path (breaks on Windows
  // when the project lives under a directory containing a space).
  reporter: process.env.PW_STREAM_REPORTER === '1'
    ? [['./server/services/suiteReporter.cjs']]
    : [['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'https://www.saucedemo.com',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
