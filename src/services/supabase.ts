import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://placeholder.supabase.co' // 개발 환경 fallback

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'placeholder-anon-key' // 개발 환경 fallback

// 환경 변수가 없으면 경고만 출력
if ((!process.env.EXPO_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) ||
    (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY && !process.env.SUPABASE_ANON_KEY)) {
  console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다. API 요청이 실패할 수 있습니다.')
  console.warn('로컬 개발: .env 파일에 EXPO_PUBLIC_SUPABASE_URL과 EXPO_PUBLIC_SUPABASE_ANON_KEY를 추가하세요.')
}

const isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production'
const isWeb = typeof window !== 'undefined'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: !isDevelopment,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'japanese-story-app@1.0.0',
    },
    fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
      if (isDevelopment && isWeb) {
        return fetch(url, {
          ...options,
          credentials: 'omit',
          headers: {
            ...options.headers,
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        })
      }
      return fetch(url, options)
    },
  },
})

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
