import { ApiService } from './api';

export interface ReviewScheduleEntry {
  date: string; // YYYY-MM-DD
  count: number;
  words: ReviewWord[];
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
  lastSeen?: string;
  lastCorrect?: string;
  lastIncorrect?: string;
}

export interface ReviewSummary {
  totalDueToday: number;
  dueTomorrow: number;
  dueThisWeek: number;
  overdueCount: number;
}

export async function fetchReviewSchedule(from: string, to: string): Promise<ReviewScheduleEntry[]> {
  return ApiService.get<ReviewScheduleEntry[]>(`/api/progress/review?from=${from}&to=${to}`, { requiresAuth: true } as never);
}

export async function fetchReviewSummary(): Promise<ReviewSummary> {
  return ApiService.get<ReviewSummary>('/api/progress/review/summary', { requiresAuth: true } as never);
}

