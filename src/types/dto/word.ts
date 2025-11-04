import type { ID, Timestamp, JLPTLevel, URL, FilePath } from './base'

/**
 * 단어 관련 DTO
 */

// 단어 품사
export type PartOfSpeech =
  | '명사'
  | '동사'
  | '형용사'
  | '부사'
  | '대명사'
  | '전치사'
  | '접속사'
  | '감탄사'
  | '조사'
  | '수사'

// 단어 난이도 (JLPT 기반)
export type WordDifficulty = JLPTLevel

// 단어 엔티티 (DB 스키마에 맞게 조정)
export interface Word {
  id: ID
  kanji: string // DB: text (nullable이지만 DTO에서는 required로)
  kana: string // DB: text
  romaji: string // DB: text
  meaning_ko?: string // DB: text (nullable)
  jlpt_level?: JLPTLevel // DB: jlpt_level (nullable)
  frequency_score: number // DB: numeric(6,3)
  tags: Record<string, any> // DB: jsonb
  created_at: Timestamp
  updated_at: Timestamp

  // DTO에서 추가하는 필드들 (DB에는 없음)
  pos?: PartOfSpeech // 품사
  pronunciation_path?: FilePath // 발음 오디오 파일
  example_sentences?: string[] // 예문들
  synonyms?: string[] // 유의어
  antonyms?: string[] // 반의어

  // 관계형 데이터 (episode_words 테이블이 없으므로 제거)
  // episode_words?: EpisodeWord[]
}

// 에피소드-단어 관계 (DB에 테이블이 없으므로 주석 처리)
// export interface EpisodeWord {
//   id: ID
//   episode_id: ID
//   word_id: ID
//   required_occurrences: number // 해당 에피소드에서 필요한 등장 횟수
//   actual_occurrences: number // 실제 등장 횟수
//   context_sentences?: string[] // 맥락 문장들
// }

// 단어 학습 진도 (SRS 기반) - DB 스키마에 맞게 조정
export interface WordProgress {
  id: ID
  user_id: ID
  word_id: ID
  level: number // DB: smallint, SRS 레벨 (0-8)
  next_review: string // DB: date, 다음 복습 날짜 (YYYY-MM-DD)
  correct_count: number // DB: integer, 맞춘 횟수
  wrong_count: number // DB: integer, 틀린 횟수
  created_at: Timestamp
  updated_at: Timestamp

  // DTO에서 추가하는 필드들 (DB에는 없음)
  streak?: number // 연속 정답 수
  last_reviewed?: Timestamp // 마지막 복습 시간
  first_learned?: Timestamp // 처음 학습한 시간
}

// SRS 리뷰 결과
export type ReviewResult = 'correct' | 'wrong' | 'hard' | 'easy'

// 단어 학습 세션
export interface WordReviewSession {
  id: ID
  user_id: ID
  word_ids: ID[]
  started_at: Timestamp
  completed_at?: Timestamp
  total_reviews: number
  correct_answers: number
  session_type: 'daily' | 'intensive' | 'weak_words'
}

// 단어 필터
export interface WordFilter {
  jlpt_level?: JLPTLevel
  pos?: PartOfSpeech
  learned?: boolean // 학습한 단어 필터링
  needs_review?: boolean // 복습 필요한 단어
  limit?: number
  offset?: number
  search?: string // 단어 검색
}

// 단어 생성/업데이트 DTO
export interface CreateWordDto {
  kanji?: string
  kana: string
  romaji: string
  meaning_ko: string
  meaning_en?: string
  jlpt_level: JLPTLevel
  pos?: PartOfSpeech
  example_sentences?: string[]
  synonyms?: string[]
  antonyms?: string[]
}

export interface UpdateWordDto extends Partial<CreateWordDto> {
  id: ID
}

// 단어 학습 결과
export interface WordReviewDto {
  word_id: ID
  result: ReviewResult
  response_time_ms?: number // 응답 시간
  context?: string // 학습 맥락
}

// 단어 통계
export interface WordStats {
  totalWords: number
  learnedWords: number
  wordsNeedingReview: number
  averageLevel: number
  dailyGoal: number
  dailyProgress: number
  streakDays: number
  jlptDistribution: Record<JLPTLevel, number>
}

// 단어 검색 결과
export interface WordSearchResult {
  word: Word
  relevance_score: number
  matched_field: 'kanji' | 'kana' | 'meaning_ko' | 'meaning_en'
}

// API 응답 타입들
export interface WordListResponse {
  words: Word[]
  total: number
  hasMore: boolean
}

export interface WordDetailResponse extends Word {
  progress?: WordProgress
  related_episodes?: {
    episode_id: ID
    episode_title: string
    context: string
  }[]
}

export interface WordReviewResponse {
  success: boolean
  new_level: number
  next_review: Timestamp
  streak: number
}

export interface DailyWordsResponse {
  words: (Word & { progress: WordProgress })[]
  total: number
  completed_today: number
}
