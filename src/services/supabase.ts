/**
 * ❌ 프론트엔드에서 Supabase 직접 사용 금지!
 * 
 * 모든 DB 연동은 서버(Edge Functions)를 통해서만 처리합니다.
 * 
 * 사용 방법:
 * - apiClient.ts의 ApiClient.get(), ApiClient.post() 사용
 * - Edge Functions 엔드포인트: /api/episodes, /api/auth, etc.
 */

throw new Error(
  '❌ Supabase를 프론트엔드에서 직접 import할 수 없습니다!\n\n' +
  '해결 방법:\n' +
  '1. apiClient.ts의 ApiClient를 사용하세요\n' +
  '2. Edge Functions를 통해 데이터를 가져오세요\n' +
  '3. eventService, authService, wordService는 사용하지 마세요 (TODO: Edge Functions로 마이그레이션)'
)

// TypeScript 에러 방지용 export (실제로 실행되지 않음)
export const supabase = null as any

// 타입 정의들
export interface Database {
  public: {
    Tables: {
      app_users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          display_name?: string | null
          avatar_url?: string | null
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          language: string
          difficulty_preference: number
          daily_goal_minutes: number
          notification_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          language?: string
          difficulty_preference?: number
          daily_goal_minutes?: number
          notification_enabled?: boolean
        }
        Update: {
          language?: string
          difficulty_preference?: number
          daily_goal_minutes?: number
          notification_enabled?: boolean
        }
      }
      episodes: {
        Row: {
          id: number
          title: string
          description: string | null
          duration_ms: number
          difficulty: number
          genre: string | null
          category: string | null
          audio_path: string
          audio_hash: string
          thumbnail_path: string | null
          published_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description?: string | null
          duration_ms?: number
          difficulty?: number
          genre?: string | null
          category?: string | null
          audio_path: string
          audio_hash: string
          thumbnail_path?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          duration_ms?: number
          difficulty?: number
          genre?: string | null
          category?: string | null
          audio_path?: string
          audio_hash?: string
          thumbnail_path?: string | null
        }
      }
      sentences: {
        Row: {
          id: number
          episode_id: number
          seq: number
          start_ms: number
          end_ms: number
          text: string
          created_at: string
        }
        Insert: {
          episode_id: number
          seq: number
          start_ms: number
          end_ms: number
          text: string
        }
        Update: {
          episode_id?: number
          seq?: number
          start_ms?: number
          end_ms?: number
          text?: string
        }
      }
      words: {
        Row: {
          id: number
          lemma: string
          pos: string | null
          definition: string | null
          example: string | null
          pronunciation_path: string | null
          frequency_rank: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          lemma: string
          pos?: string | null
          definition?: string | null
          example?: string | null
          pronunciation_path?: string | null
          frequency_rank?: number | null
        }
        Update: {
          lemma?: string
          pos?: string | null
          definition?: string | null
          example?: string | null
          pronunciation_path?: string | null
          frequency_rank?: number | null
        }
      }
      user_word_progress: {
        Row: {
          user_id: string
          word_id: number
          level: number
          next_review: string
          correct_count: number
          wrong_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          word_id: number
          level?: number
          next_review?: string
          correct_count?: number
          wrong_count?: number
        }
        Update: {
          user_id?: string
          word_id?: number
          level?: number
          next_review?: string
          correct_count?: number
          wrong_count?: number
        }
      }
      episode_progress: {
        Row: {
          user_id: string
          episode_id: string
          current_position_ms: number
          playback_rate: number
          completed: boolean
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          episode_id: string
          current_position_ms?: number
          playback_rate?: number
          completed?: boolean
        }
        Update: {
          user_id?: string
          episode_id?: string
          current_position_ms?: number
          playback_rate?: number
          completed?: boolean
          completed_at?: string | null
        }
      }
      event_log: {
        Row: {
          id: number
          user_id: string
          event_name: string
          episode_id: string | null
          properties: Record<string, any>
          created_at: string
        }
        Insert: {
          user_id: string
          event_name: string
          episode_id?: string | null
          properties?: Record<string, any>
        }
        Update: {
          user_id?: string
          event_name?: string
          episode_id?: string | null
          properties?: Record<string, any>
        }
      }
    }
  }
}

// 헬퍼 함수들
export const getSupabaseErrorMessage = (error: any): string => {
  if (error?.message) {
    // 특정 에러 메시지들을 사용자 친화적으로 변환
    if (error.message.includes('JWT')) {
      return '인증이 만료되었습니다. 다시 로그인해주세요.'
    }
    if (error.message.includes('duplicate key')) {
      return '이미 존재하는 데이터입니다.'
    }
    if (error.message.includes('violates foreign key')) {
      return '관련 데이터가 존재하지 않습니다.'
    }
    return error.message
  }
  return '알 수 없는 오류가 발생했습니다.'
}

export const isSupabaseError = (error: any): boolean => {
  return error && typeof error === 'object' && 'message' in error
}
