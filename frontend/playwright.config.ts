/// <reference types="node" />

import { defineConfig, devices } from '@playwright/test'

const frontendBaseUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['junit', { outputFile: 'playwright-results.xml' }],
      ]
    : 'list',
  use: {
    baseURL: frontendBaseUrl,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview:e2e',
    url: frontendBaseUrl,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
