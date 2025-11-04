import { test, expect } from '@playwright/test'

// React 앱이 마운트될 때까지 대기
async function waitForReactApp(page: any) {
  await page.goto('/', { waitUntil: 'load' })
  // #root가 비어있지 않을 때까지 대기
  await page.waitForFunction(() => {
    const root = document.getElementById('root')
    return root && root.children.length > 0
  }, { timeout: 30000 })
}

test.describe('홈 화면', () => {
  test('히어로 정보와 추천 섹션이 노출된다', async ({ page }) => {
    await waitForReactApp(page)

    await expect(page.getByText('와, 오늘도 이야기 한 컵 어떠세요?')).toBeVisible()
    await expect(page.getByText('오늘의 추천')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId(/episode-card-.+/).first()).toBeVisible()
  })

  test('없는 에피소드 상세로 이동하면 안내가 노출된다', async ({ page }) => {
    await page.goto('/episode/999999', { waitUntil: 'load' })
    // React 앱이 마운트될 때까지 대기
    await page.waitForFunction(() => {
      const root = document.getElementById('root')
      return root && root.children.length > 0
    }, { timeout: 30000 })

    // API 요청 완료 후 에러 메시지가 렌더링될 때까지 대기 (최대 15초)
    await expect(page.getByText('에피소드를 찾을 수 없어요')).toBeVisible({ timeout: 15000 })
  })
})




