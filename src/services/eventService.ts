import { supabase } from './supabase'
import type { Database } from './supabase'

type EventLog = Database['public']['Tables']['event_log']['Insert']

export interface EventProperties {
  [key: string]: any
}

export class EventService {
  // 이벤트 큐 - 배치 전송을 위해 저장
  private static eventQueue: Array<Omit<EventLog, 'user_id'>> = []
  private static flushTimer: ReturnType<typeof setTimeout> | null = null
  private static currentUserId: string | null = null

  // 사용자 ID 설정 (로그인 시 호출)
  static setUserId(userId: string) {
    this.currentUserId = userId
  }

  // 사용자 ID 초기화 (로그아웃 시 호출)
  static clearUserId() {
    this.currentUserId = null
    this.eventQueue = []
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
  }

  // 이벤트 기록 (즉시 기록 또는 큐에 추가)
  static logEvent(
    eventName: string,
    properties: EventProperties = {},
    episodeId?: string
  ): void {
    if (!this.currentUserId) {
      console.warn('EventService: No user ID set, skipping event:', eventName)
      return
    }

    const event = {
      event_name: eventName,
      episode_id: episodeId ?? null,
      properties: {
        ...properties,
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        url: window.location.href
      },
      created_at: new Date().toISOString()
    }

    this.eventQueue.push(event)

    // 10개 이상 쌓이면 즉시 전송, 아니면 5초 후 전송
    if (this.eventQueue.length >= 10) {
      this.flushEvents()
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flushEvents(), 5000)
    }
  }

  // 이벤트 큐 플러시 (서버로 전송)
  private static async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.currentUserId) return

    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }

    const events = [...this.eventQueue]
    this.eventQueue = []

    try {
      // 이벤트에 user_id 추가
      const eventsWithUserId = events.map(event => ({
        ...event,
        user_id: this.currentUserId!
      }))

      const { error } = await supabase
        .from('event_log')
        .insert(eventsWithUserId)

      if (error) {
        console.error('Event logging failed:', error)
        // 실패한 이벤트들은 다시 큐에 추가 (재시도)
        this.eventQueue.unshift(...events)
        return
      }

      console.log(`Successfully logged ${events.length} events`)
    } catch (error) {
      console.error('Event logging error:', error)
      // 실패한 이벤트들은 다시 큐에 추가
      this.eventQueue.unshift(...events)
    }
  }

  // 페이지뷰 이벤트
  static logPageView(pageName: string, properties: EventProperties = {}): void {
    this.logEvent('page_view', {
      page_name: pageName,
      ...properties
    })
  }

  // 재생 시작 이벤트
  static logPlayStart(episodeId: string, positionMs = 0): void {
    this.logEvent('play_start', {
      position_ms: positionMs,
      playback_rate: 1.0
    }, episodeId)
  }

  // 재생 일시정지 이벤트
  static logPlayPause(episodeId: string, positionMs: number): void {
    this.logEvent('play_pause', {
      position_ms: positionMs
    }, episodeId)
  }

  // 재생 정지 이벤트
  static logPlayStop(episodeId: string, positionMs: number, totalPlayedMs: number): void {
    this.logEvent('play_stop', {
      position_ms: positionMs,
      total_played_ms: totalPlayedMs
    }, episodeId)
  }

  // 탐색(Seek) 이벤트
  static logSeek(episodeId: string, fromMs: number, toMs: number): void {
    this.logEvent('seek', {
      from_ms: fromMs,
      to_ms: toMs,
      seek_distance: Math.abs(toMs - fromMs)
    }, episodeId)
  }

  // 재생 속도 변경 이벤트
  static logPlaybackRateChange(episodeId: string, oldRate: number, newRate: number): void {
    this.logEvent('playback_rate_change', {
      old_rate: oldRate,
      new_rate: newRate
    }, episodeId)
  }

  // A-B 반복 설정 이벤트
  static logABRepeatSet(episodeId: string, startMs: number, endMs: number): void {
    this.logEvent('ab_repeat_set', {
      start_ms: startMs,
      end_ms: endMs,
      duration_ms: endMs - startMs
    }, episodeId)
  }

  // 에피소드 완료 이벤트
  static logEpisodeComplete(episodeId: string, totalTimeMs: number, completionRate: number): void {
    this.logEvent('episode_complete', {
      total_time_ms: totalTimeMs,
      completion_rate: completionRate
    }, episodeId)
  }

  // 단어 저장 이벤트
  static logWordSave(wordId: number, episodeId?: string): void {
    this.logEvent('word_save', {
      word_id: wordId
    }, episodeId)
  }

  // 단어 복습 이벤트
  static logWordReview(wordId: number, isCorrect: boolean, responseTimeMs: number): void {
    this.logEvent('word_review', {
      word_id: wordId,
      is_correct: isCorrect,
      response_time_ms: responseTimeMs,
      level_change: isCorrect ? 1 : -1
    })
  }

  // 검색 이벤트
  static logSearch(query: string, resultCount: number, searchType: 'episode' | 'word'): void {
    this.logEvent('search', {
      query,
      result_count: resultCount,
      search_type: searchType
    })
  }

  // 설정 변경 이벤트
  static logSettingsChange(settingName: string, oldValue: any, newValue: any): void {
    this.logEvent('settings_change', {
      setting_name: settingName,
      old_value: oldValue,
      new_value: newValue
    })
  }

  // 에러 이벤트
  static logError(error: Error, context: EventProperties = {}): void {
    this.logEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context
    })
  }

  // 앱 시작 이벤트
  static logAppStart(): void {
    this.logEvent('app_start', {
      platform: navigator.platform,
      language: navigator.language,
      screen_size: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`
    })
  }

  // 앱 종료 이벤트 (beforeunload)
  static logAppExit(sessionDurationMs: number): void {
    // 동기적으로 즉시 전송 (앱 종료 시)
    this.flushEventsSync(sessionDurationMs)
  }

  // 동기식 이벤트 플러시 (앱 종료 시)
  private static flushEventsSync(sessionDurationMs: number): void {
    if (this.eventQueue.length === 0 || !this.currentUserId) return

    // 앱 종료 이벤트 추가
    const exitEvent = {
      event_name: 'app_exit',
      episode_id: null,
      properties: {
        session_duration_ms: sessionDurationMs,
        queued_events: this.eventQueue.length
      },
      created_at: new Date().toISOString(),
      user_id: this.currentUserId
    }

    // Beacon API를 사용한 동기 전송 (비동기로 실패해도 앱이 종료됨)
    const eventsToSend = [...this.eventQueue, exitEvent]
    const blob = new Blob([JSON.stringify(eventsToSend)], {
      type: 'application/json'
    })

    // 실제 구현에서는 서버 엔드포인트로 전송
    // navigator.sendBeacon('/api/events/batch', blob)

    console.log('App exit - events sent via beacon:', eventsToSend.length)
  }

  // 이벤트 통계 조회 (관리자용)
  static async getEventStats(
    userId: string,
    dateRange: { start: string; end: string }
  ): Promise<{
    data: {
      totalEvents: number
      eventTypes: Record<string, number>
      dailyActivity: Array<{ date: string; count: number }>
    } | null;
    error: any
  }> {
    try {
      const { data, error } = await supabase
        .from('event_log')
        .select('event_name, created_at')
        .eq('user_id', userId)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)

      if (error) throw error

      const stats = {
        totalEvents: data?.length || 0,
        eventTypes: data?.reduce((acc, event) => {
          acc[event.event_name] = (acc[event.event_name] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {},
        dailyActivity: this.groupEventsByDate(data || [])
      }

      return { data: stats, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 날짜별 이벤트 그룹화 헬퍼
  private static groupEventsByDate(events: Array<{ created_at: string }>): Array<{ date: string; count: number }> {
    const grouped = events.reduce((acc, event) => {
      const date = new Date(event.created_at).toDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // 오래된 이벤트 정리 (30일 이상 된 이벤트 삭제)
  static async cleanupOldEvents(daysOld = 30): Promise<{ error: any }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const { error } = await supabase
        .from('event_log')
        .delete()
        .lt('created_at', cutoffDate.toISOString())

      return { error }
    } catch (error) {
      return { error }
    }
  }
}
