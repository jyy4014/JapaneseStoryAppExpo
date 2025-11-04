import type { ID, Timestamp, JLPTLevel } from './base'

/**
 * 에피소드 관련 DTO (클라이언트에서 사용하는 형태 - camelCase)
 */

export type EpisodeStatus = 'draft' | 'published' | 'archived'

export interface Episode {
  id: string
  title: string
  level: JLPTLevel
  durationSeconds: number | null
  durationMs: number | null
  difficulty: number | null
  summary: string | null
  script: string | null
  genre: string | null
  category: string | null
  audioPath: string | null
  audioHash: string | null
  thumbnailPath: string | null
  published: boolean | null
  isVerified: boolean | null
  publishedAt: Timestamp | null
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
  sentences?: Sentence[]
  progress?: EpisodeProgress | null
}

export interface Sentence {
  id: string
  episodeId: string
  seq: number | null
  text: string | null
  startMs: number | null
  endMs: number | null
  createdAt: Timestamp | null
}

export interface EpisodeProgress {
  id: string
  userId: string
  episodeId: string
  currentPositionMs: number
  completed: boolean | null
  completedAt: Timestamp | null
  score: number | null
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export interface EpisodeFilter {
  difficulty?: number
  genre?: string
  category?: string
  limit?: number
  offset?: number
}

export interface EpisodeListResponse {
  episodes: Episode[]
}

export interface EpisodeDetailResponse extends Episode {}

export interface EpisodeProgressResponse {
  progress: EpisodeProgress
  completionRate?: number
}

export interface CreateEpisodeDto {
  title: string
  summary?: string | null
  script?: string | null
  level?: JLPTLevel
  genre?: string | null
  category?: string | null
  published?: boolean
}

export interface UpdateEpisodeDto extends Partial<CreateEpisodeDto> {
  id: ID
}

export interface EpisodeStats {
  totalEpisodes: number
  publishedEpisodes: number
  totalDurationMinutes: number
  averageDifficulty: number | null
}