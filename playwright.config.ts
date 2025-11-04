import { defineConfig, devices } from '@playwright/test';

const localPreviewUrl = 'http://127.0.0.1:4174';
const baseUrl = process.env.E2E_BASE_URL ?? localPreviewUrl;
const shouldStartLocalServer = !process.env.E2E_BASE_URL;

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
  webServer: shouldStartLocalServer
    ? {
        command: 'npx serve -s dist -l 4174',
        url: localPreviewUrl,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
});

