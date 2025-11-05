/**
 * 시간을 MM:SS 형식으로 포맷팅
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 밀리초를 초 단위로 변환
 */
export function msToSeconds(ms: number): number {
  return Math.floor(ms / 1000)
}

/**
 * 초를 밀리초로 변환
 */
export function secondsToMs(seconds: number): number {
  return Math.floor(seconds * 1000)
}

/**
 * 지속 시간을 읽기 쉬운 형식으로 변환
 */
export function formatDuration(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return '0분'

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`
  }

  return `${minutes}분`
}

/**
 * 두 시간 사이의 차이를 계산
 */
export function getTimeDifference(startMs: number, endMs: number): number {
  return Math.abs(endMs - startMs)
}




