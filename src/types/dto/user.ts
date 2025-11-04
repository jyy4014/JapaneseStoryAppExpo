import type { ID, Timestamp, JLPTLevel, URL, FilePath } from './base'

/**
 * 사용자 관련 DTO
 */

// 사용자 역할
export type UserRole = 'user' | 'admin' | 'moderator'

// 사용자 상태
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned'

// 사용자 엔티티 (DB 스키마에 맞게 조정)
export interface User {
  id: ID // DB: uuid (nullable)
  auth_uid: string // DB: text (nullable), Supabase Auth UID
  email: string // DB: text (nullable)
  display_name: string // DB: text (nullable)
  preferred_level: JLPTLevel // DB: jlpt_level (nullable)
  settings: Record<string, any> // DB: jsonb (nullable)
  created_at: Timestamp // DB: timestamp (nullable)
  updated_at: Timestamp // DB: timestamp (nullable)

  // DTO에서 추가하는 필드들 (DB에는 없음)
  role?: UserRole
  status?: UserStatus
  email_verified?: boolean
  avatar_url?: URL
  last_login_at?: Timestamp
}

// 사용자 프로필 (확장 정보)
export interface UserProfile extends User {
  // 학습 설정
  preferred_level: JLPTLevel
  daily_goal_minutes: number
  notification_enabled: boolean

  // 학습 통계
  total_study_time: number // 분 단위
  current_streak: number
  longest_streak: number
  total_episodes_completed: number
  total_words_learned: number

  // 언어 설정
  language: 'ko' | 'en' | 'ja'
  timezone: string
}

// 사용자 기본 설정 (DB 스키마에 맞게 조정)
export interface UserPreferences {
  user_id: ID
  language: string // DB: text (nullable)
  difficulty_preference: number // DB: smallint (nullable), 선호 난이도 레벨
  daily_goal_minutes: number // DB: integer (nullable)
  notification_enabled: boolean // DB: boolean (nullable)
  created_at: Timestamp // DB: timestamp (nullable)
  updated_at: Timestamp // DB: timestamp (nullable)

  // DTO에서 추가하는 필드들 (DB에는 없음)
  timezone?: string
  theme?: 'light' | 'dark' | 'auto'
  sound_enabled?: boolean
  auto_play?: boolean
  playback_speed?: number
}

// 학습 통계
export interface UserStats {
  user_id: ID

  // 에피소드 통계
  total_episodes_started: number
  total_episodes_completed: number
  completion_rate: number
  average_session_time: number // 분
  total_study_time: number // 분

  // 단어 통계
  total_words_learned: number
  words_needing_review: number
  average_difficulty: JLPTLevel
  daily_words_goal: number
  daily_words_progress: number

  // 연속 학습
  current_streak: number
  longest_streak: number
  last_study_date?: Timestamp

  // 성취
  achievements: Achievement[]
  level: number // 학습 레벨
  experience_points: number

  updated_at: Timestamp
}

// 성취 시스템
export interface Achievement {
  id: ID
  name: string
  description: string
  icon: string
  category: 'study' | 'streak' | 'words' | 'episodes' | 'social'
  requirement: number
  reward_points: number
  unlocked_at?: Timestamp
}

// 사용자 활동 로그
export interface UserActivity {
  id: ID
  user_id: ID
  activity_type: 'login' | 'episode_start' | 'episode_complete' | 'word_learn' | 'word_review'
  metadata: Record<string, any> // 활동별 추가 데이터
  created_at: Timestamp
}

// 사용자 생성/업데이트 DTO
export interface CreateUserDto {
  email: string
  display_name?: string
  avatar_url?: URL
  preferred_level?: JLPTLevel
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  id: ID
}

export interface UpdateUserPreferencesDto extends Partial<UserPreferences> {
  user_id: ID
}

// 인증 관련 DTO
export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  display_name?: string
  preferred_level?: JLPTLevel
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface RefreshTokenDto {
  refresh_token: string
}

// 비밀번호 재설정
export interface ResetPasswordDto {
  email: string
}

export interface ChangePasswordDto {
  current_password: string
  new_password: string
}

// API 응답 타입들
export interface UserProfileResponse extends UserProfile {
  stats: UserStats
  preferences: UserPreferences
}

export interface UserStatsResponse extends UserStats {
  recent_activities: UserActivity[]
  upcoming_reviews: {
    word_id: ID
    word_kana: string
    next_review: Timestamp
    level: number
  }[]
}

export interface AchievementsResponse {
  achievements: Achievement[]
  unlocked_count: number
  total_count: number
}



