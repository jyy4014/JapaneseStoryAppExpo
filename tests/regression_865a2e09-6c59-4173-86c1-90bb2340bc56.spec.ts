
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('Regression_2025-11-03', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:4174', { waitUntil: 'domcontentloaded' });
});