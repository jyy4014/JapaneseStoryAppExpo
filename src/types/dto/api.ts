import type { ApiResponse, PaginationMeta } from './base'
import type {
  Episode, EpisodeFilter, EpisodeListResponse, EpisodeDetailResponse,
  CreateEpisodeDto, UpdateEpisodeDto, EpisodeProgress, EpisodeProgressResponse
} from './episode'
import type {
  Word, WordFilter, WordListResponse, WordDetailResponse,
  CreateWordDto, UpdateWordDto, WordReviewDto, WordReviewResponse,
  WordStats, DailyWordsResponse
} from './word'
import type {
  User, UserProfile, UserStats, UserPreferences,
  LoginDto, RegisterDto, AuthResponse, RefreshTokenDto,
  UpdateUserDto, UpdateUserPreferencesDto, UserProfileResponse, UserStatsResponse
} from './user'

/**
 * API 요청/응답 DTO
 */

// 공통 API 응답 래퍼
export interface ApiSuccessResponse<T> extends ApiResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse extends ApiResponse {
  success: false
  error: string
  code?: string
  details?: Record<string, any>
}

// ============ 에피소드 API ============

// 에피소드 목록 조회
export interface GetEpisodesRequest extends EpisodeFilter {}
export type GetEpisodesResponse = ApiSuccessResponse<EpisodeListResponse>

// 에피소드 상세 조회
export interface GetEpisodeRequest {
  id: string | number
}
export type GetEpisodeResponse = ApiSuccessResponse<EpisodeDetailResponse>

// 에피소드 생성
export type CreateEpisodeRequest = CreateEpisodeDto
export type CreateEpisodeResponse = ApiSuccessResponse<Episode>

// 에피소드 수정
export type UpdateEpisodeRequest = UpdateEpisodeDto
export type UpdateEpisodeResponse = ApiSuccessResponse<Episode>

// 에피소드 삭제
export interface DeleteEpisodeRequest {
  id: string | number
}
export type DeleteEpisodeResponse = ApiSuccessResponse<{ deleted: boolean }>

// 에피소드 진도 조회
export interface GetEpisodeProgressRequest {
  episodeId: string | number
}
export type GetEpisodeProgressResponse = ApiSuccessResponse<EpisodeProgressResponse>

// 에피소드 진도 저장/업데이트
export interface SaveEpisodeProgressRequest {
  episodeId: string | number
  progress: Partial<EpisodeProgress>
}
export type SaveEpisodeProgressResponse = ApiSuccessResponse<EpisodeProgress>

// ============ 단어 API ============

// 단어 목록 조회
export interface GetWordsRequest extends WordFilter {}
export type GetWordsResponse = ApiSuccessResponse<WordListResponse>

// 단어 상세 조회
export interface GetWordRequest {
  id: string | number
}
export type GetWordResponse = ApiSuccessResponse<WordDetailResponse>

// 단어 생성
export type CreateWordRequest = CreateWordDto
export type CreateWordResponse = ApiSuccessResponse<Word>

// 단어 수정
export type UpdateWordRequest = UpdateWordDto
export type UpdateWordResponse = ApiSuccessResponse<Word>

// 단어 삭제
export interface DeleteWordRequest {
  id: string | number
}
export type DeleteWordResponse = ApiSuccessResponse<{ deleted: boolean }>

// 단어 학습
export type ReviewWordRequest = WordReviewDto
export type ReviewWordResponse = ApiSuccessResponse<WordReviewResponse>

// 일일 학습 단어 조회
export interface GetDailyWordsRequest {
  date?: string // YYYY-MM-DD
}
export type GetDailyWordsResponse = ApiSuccessResponse<DailyWordsResponse>

// 단어 통계 조회
export interface GetWordStatsRequest {
  userId?: string | number
}
export type GetWordStatsResponse = ApiSuccessResponse<WordStats>

// ============ 사용자 API ============

// 로그인
export type LoginRequest = LoginDto
export type LoginResponse = ApiSuccessResponse<AuthResponse>

// 회원가입
export type RegisterRequest = RegisterDto
export type RegisterResponse = ApiSuccessResponse<AuthResponse>

// 토큰 갱신
export type RefreshTokenRequest = RefreshTokenDto
export type RefreshTokenResponse = ApiSuccessResponse<AuthResponse>

// 로그아웃
export type LogoutResponse = ApiSuccessResponse<{ loggedOut: boolean }>

// 사용자 프로필 조회
export interface GetUserProfileRequest {
  userId?: string | number // 없으면 현재 사용자
}
export type GetUserProfileResponse = ApiSuccessResponse<UserProfileResponse>

// 사용자 프로필 수정
export type UpdateUserProfileRequest = UpdateUserDto
export type UpdateUserProfileResponse = ApiSuccessResponse<UserProfile>

// 사용자 설정 수정
export type UpdateUserPreferencesRequest = UpdateUserPreferencesDto
export type UpdateUserPreferencesResponse = ApiSuccessResponse<UserPreferences>

// 사용자 통계 조회
export interface GetUserStatsRequest {
  userId?: string | number
}
export type GetUserStatsResponse = ApiSuccessResponse<UserStatsResponse>

// 비밀번호 변경
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
export type ChangePasswordResponse = ApiSuccessResponse<{ changed: boolean }>

// 비밀번호 재설정 요청
export interface ResetPasswordRequest {
  email: string
}
export type ResetPasswordResponse = ApiSuccessResponse<{ sent: boolean }>

// ============ 분석/통계 API ============

// 대시보드 통계
export interface GetDashboardStatsRequest {
  period?: 'day' | 'week' | 'month' | 'year'
}
export type GetDashboardStatsResponse = ApiSuccessResponse<{
  user_stats: UserStats
  episode_stats: {
    total_episodes: number
    completed_today: number
    study_time_today: number
  }
  word_stats: WordStats
  recent_activities: Array<{
    type: string
    description: string
    timestamp: string
  }>
}>

// 학습 히트맵 데이터
export interface GetStudyHeatmapRequest {
  year: number
  userId?: string | number
}
export type GetStudyHeatmapResponse = ApiSuccessResponse<{
  dates: Record<string, number> // YYYY-MM-DD: study minutes
}>

// ============ 검색 API ============

// 통합 검색
export interface SearchRequest {
  query: string
  type?: 'all' | 'episodes' | 'words' | 'users'
  limit?: number
  offset?: number
}
export type SearchResponse = ApiSuccessResponse<{
  episodes: Episode[]
  words: Word[]
  users: User[]
  total: number
}>

// ============ 이벤트 로깅 API ============

// 이벤트 로깅
export interface LogEventRequest {
  event_type: string
  metadata?: Record<string, any>
  episode_id?: string | number
  word_id?: string | number
}
export type LogEventResponse = ApiSuccessResponse<{ logged: boolean }>

// 이벤트 조회
export interface GetEventsRequest {
  userId?: string | number
  eventType?: string
  limit?: number
  offset?: number
  startDate?: string
  endDate?: string
}
export type GetEventsResponse = ApiSuccessResponse<{
  events: Array<{
    id: string
    event_type: string
    metadata: Record<string, any>
    created_at: string
  }>
  total: number
}>

// ============ TTS/오디오 API ============

// TTS 생성 요청
export interface GenerateTTSRequest {
  episodeId: string | number
  voice?: string
  speed?: number
}
export type GenerateTTSResponse = ApiSuccessResponse<{
  audio_url: string
  duration_ms: number
  generated_at: string
}>

// 오디오 URL 조회
export interface GetAudioUrlRequest {
  episodeId: string | number
}
export type GetAudioUrlResponse = ApiSuccessResponse<{
  audio_url: string
  duration_ms: number
  source: 'existing' | 'generated'
}>

// ============ 업로드 API ============

// 파일 업로드 응답
export interface UploadResponse {
  file_path: string
  file_url: string
  file_size: number
  mime_type: string
}
