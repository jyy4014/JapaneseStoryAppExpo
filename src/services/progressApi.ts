import { ApiService } from './api';

export interface ProgressSummary {
  totalEpisodesCompleted: number;
  totalListeningMinutes: number;
  averageQuizScore: number;
  streakCount?: number;
  lastUpdated?: string;
}

export interface ContinueEpisode {
  id: string;
  title: string;
  level: string;
  playPositionMs: number;
  durationMs: number;
  thumbnailUrl?: string;
}

export interface ReviewWord {
  id: string;
  kanji?: string;
  kana?: string;
  meaningKo: string;
  nextReview?: string;
  easiness: number;
  intervalDays: number;
  repetitions: number;
}

export async function fetchProgressSummary(): Promise<ProgressSummary> {
  return ApiService.get('/api/progress/summary', { requiresAuth: true } as never);
}

export async function fetchContinueEpisodes(): Promise<ContinueEpisode[]> {
  return ApiService.get('/api/progress/continue', { requiresAuth: true } as never);
}

export async function fetchReviewWords(limit = 10): Promise<ReviewWord[]> {
  return ApiService.get(`/api/progress/review?limit=${limit}`, { requiresAuth: true } as never);
}
