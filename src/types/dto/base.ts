/**
 * 공통 타입 정의
 */

// 난이도 레벨 (JLPT 기준)
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

// 이벤트 타입
export type EventType =
  | 'episode_started'
  | 'episode_completed'
  | 'sentence_played'
  | 'word_saved'
  | 'word_reviewed'
  | 'audio_generated'

// HTTP 메소드
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// API 응답 기본 구조
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

// 페이지네이션 메타데이터
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// 정렬 옵션
export type SortOrder = 'asc' | 'desc'

export interface SortOption {
  field: string
  order: SortOrder
}

// 필터 기본 구조
export interface BaseFilter {
  limit?: number
  offset?: number
  sort?: SortOption
}

// 타임스탬프 타입
export type Timestamp = string // ISO 8601 format

// ID 타입
export type ID = string | number

// URL 타입
export type URL = string

// 파일 경로 타입
export type FilePath = string