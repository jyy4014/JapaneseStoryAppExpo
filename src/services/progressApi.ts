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
  return ApiService.get('/progress/summary', { requiresAuth: true });
}

export async function fetchContinueEpisodes(): Promise<ContinueEpisode[]> {
  return ApiService.get('/progress/continue', { requiresAuth: true });
}

export async function fetchReviewWords(limit = 10): Promise<ReviewWord[]> {
  return ApiService.get(`/progress/review?limit=${limit}`, { requiresAuth: true });
}
