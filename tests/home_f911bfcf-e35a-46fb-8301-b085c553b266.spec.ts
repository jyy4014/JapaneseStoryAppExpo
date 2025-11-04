
import { test, expect } from '@playwright/test';

test.describe('홈 → 에피소드 상세 → CTA 흐름', () => {
  test('사용자가 추천 에피소드에서 듣기 시작 CTA를 실행할 수 있다', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.getByText('오늘 들고 싶은 난이도는?')).toBeVisible();
    const firstEpisodeCard = page.getByTestId(/episode-card-.+/).first();
    await expect(firstEpisodeCard).toBeVisible({ timeout: 15000 });

    await firstEpisodeCard.click();

    await expect(page).toHaveURL(/episode\//);

    const dialogPromise = new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), 4000);
      page.once('dialog', async (dialog) => {
        clearTimeout(timeout);
        try {
          expect(dialog.message()).toMatch(/재생 준비 완료|오디오를 준비하지 못했습니다/);
        } finally {
          await dialog.dismiss();
          resolve();
        }
      });
    });

    const listenButton = page.getByText('듣기 시작');
    await listenButton.scrollIntoViewIfNeeded();
    await listenButton.click();

    await dialogPromise;

    await page.goBack();

    await expect(page.getByText('오늘의 추천')).toBeVisible();
  });
});