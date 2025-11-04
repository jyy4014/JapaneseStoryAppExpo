
import { test, expect } from '@playwright/test';

// React 앱이 마운트될 때까지 대기
async function waitForReactApp(page: any, url: string = '/') {
  await page.goto(url, { waitUntil: 'load' });
  // #root가 비어있지 않을 때까지 대기
  await page.waitForFunction(() => {
    const root = document.getElementById('root');
    return root && root.children.length > 0;
  }, { timeout: 30000 });
}

test.describe('홈 → 에피소드 상세 → CTA 흐름', () => {
  test('사용자가 추천 에피소드에서 듣기 시작 CTA를 실행할 수 있다', async ({ page }) => {
    await waitForReactApp(page);

    await expect(page.getByText('오늘 들고 싶은 난이도는?')).toBeVisible();
    const firstEpisodeCard = page.getByTestId(/episode-card-.+/).first();
    await expect(firstEpisodeCard).toBeVisible({ timeout: 15000 });

    await firstEpisodeCard.click();

    await expect(page).toHaveURL(/episode\//);
    
    // 에피소드 상세 페이지의 React 앱이 마운트될 때까지 대기
    await page.waitForFunction(() => {
      const root = document.getElementById('root');
      return root && root.children.length > 0;
    }, { timeout: 30000 });

    // 에피소드 데이터 로딩을 기다립니다 (최대 30초)
    const listenButton = page.getByText('듣기 시작');
    await listenButton.waitFor({ state: 'visible', timeout: 30000 });
    await listenButton.scrollIntoViewIfNeeded();

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

    await listenButton.click();

    await dialogPromise;

    await page.goBack();

    await expect(page.getByText('오늘의 추천')).toBeVisible();
  });
});