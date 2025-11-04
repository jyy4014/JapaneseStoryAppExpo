import { test, expect } from '@playwright/test'

test.describe('디버깅 테스트', () => {
  test('에피소드 상세 페이지 디버깅', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // 첫 번째 에피소드 카드 클릭
    const firstEpisodeCard = page.getByTestId(/episode-card-.+/).first()
    await expect(firstEpisodeCard).toBeVisible({ timeout: 15000 })
    await firstEpisodeCard.click()

    // URL 확인
    await expect(page).toHaveURL(/episode\//)
    
    // 5초 대기 후 스크린샷
    await page.waitForTimeout(5000)
    await page.screenshot({ path: 'test-results/episode-detail-page.png', fullPage: true })

    // 페이지 내용 출력
    const pageContent = await page.content()
    console.log('=== 페이지 HTML (처음 1000자) ===')
    console.log(pageContent.substring(0, 1000))

    // 모든 텍스트 콘텐츠 확인
    const bodyText = await page.locator('body').textContent()
    console.log('=== 페이지 텍스트 콘텐츠 ===')
    console.log(bodyText)

    // 특정 요소 찾기
    const listenButton = page.getByText('듣기 시작')
    const isVisible = await listenButton.isVisible().catch(() => false)
    console.log('=== "듣기 시작" 버튼 존재 여부 ===', isVisible)

    // 모든 버튼 텍스트 출력
    const buttons = await page.locator('button, [role="button"]').allTextContents()
    console.log('=== 페이지의 모든 버튼 텍스트 ===', buttons)
  })

  test('404 에러 페이지 디버깅', async ({ page }) => {
    await page.goto('/episode/999999', { waitUntil: 'networkidle' })

    // 5초 대기 후 스크린샷
    await page.waitForTimeout(5000)
    await page.screenshot({ path: 'test-results/error-page.png', fullPage: true })

    // 페이지 내용 출력
    const pageContent = await page.content()
    console.log('=== 404 페이지 HTML (처음 1000자) ===')
    console.log(pageContent.substring(0, 1000))

    // 모든 텍스트 콘텐츠 확인
    const bodyText = await page.locator('body').textContent()
    console.log('=== 404 페이지 텍스트 콘텐츠 ===')
    console.log(bodyText)

    // 에러 메시지 찾기
    const errorMessage = page.getByText('에피소드를 찾을 수 없어요')
    const isVisible = await errorMessage.isVisible().catch(() => false)
    console.log('=== "에피소드를 찾을 수 없어요" 메시지 존재 여부 ===', isVisible)

    // 특정 텍스트가 있는지 확인
    const hasErrorText = await page.locator('text=/찾을 수 없/').count()
    console.log('=== "찾을 수 없" 포함 요소 개수 ===', hasErrorText)
  })
})

