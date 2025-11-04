import { test, expect } from '@playwright/test'

test.describe('홈 화면', () => {
  test('히어로 정보와 추천 섹션이 노출된다', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    await expect(page.getByText('와, 오늘도 이야기 한 컵 어떠세요?')).toBeVisible()
    await expect(page.getByText('오늘의 추천')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId(/episode-card-.+/).first()).toBeVisible()
  })

  test('없는 에피소드 상세로 이동하면 안내가 노출된다', async ({ page }) => {
    await page.goto('/episode/999999', { waitUntil: 'networkidle' })

    await expect(page.getByText('에피소드를 찾을 수 없어요')).toBeVisible()
  })
})




