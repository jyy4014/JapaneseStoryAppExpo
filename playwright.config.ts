import { defineConfig, devices } from '@playwright/test';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:19006';

export default defineConfig({
  testDir: './tests',
  retries: 1,
  timeout: 30000,
  use: {
    baseURL: baseUrl,
    actionTimeout: 10000,
    navigationTimeout: 15000,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});

