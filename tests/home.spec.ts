import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:19006';

test.describe('Home Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should render home title and story cards', async ({ page }) => {
    await expect(page.getByText('사연으로 배우는 일본어')).toBeVisible();
    await expect(page.getByText('스토리를 들으며 자연스럽게 단어를 학습해보세요.')).toBeVisible();
  });
});

