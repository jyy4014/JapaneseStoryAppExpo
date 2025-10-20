import Constants from 'expo-constants';
import useAuthStore from '../store/useAuthStore';
import logger from '../utils/logger';
import type { StorySummary } from '../store/useStoryStore';
import type { EpisodeDetailResponse } from '../hooks/useStoryDetail';
import type { QuizAttemptResponse, QuizSubmissionResponse } from '../types/quiz';

const SUPABASE_FUNCTIONS_URL = Constants.expoConfig?.extra?.supabaseFunctionsUrl as string | undefined;
const API_BASE_URL = SUPABASE_FUNCTIONS_URL
  ? `${SUPABASE_FUNCTIONS_URL.replace(/\/$/, '')}/api`
  : 'https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api';

const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined;
const SUPABASE_STORAGE_BASE_URL = Constants.expoConfig?.extra?.supabaseStorageBaseUrl as string | undefined;

export function getSupabaseStorageBaseUrl() {
  return SUPABASE_STORAGE_BASE_URL ?? 'https://yzcscpcrakpdfsvluyej.supabase.co/storage/v1/object/public';
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<Body> {
  method?: HttpMethod;
  body?: Body;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

async function request<TResponse, TBody = unknown>(
  path: string,
  { method = 'GET', body, headers = {}, requiresAuth = false }: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const { idToken } = useAuthStore.getState();
  logger.debug('ApiService', 'request:start', { path, method, requiresAuth });

  let response: Response;

  try {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${normalizedPath}`;
    const authHeader: Record<string, string> = {};

    if (requiresAuth && idToken) {
      authHeader.Authorization = `Bearer ${idToken}`;
    } else if (SUPABASE_ANON_KEY) {
      authHeader.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
    }

    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    logger.error('ApiService', 'request:networkError', { path, method, error: networkError });
    throw networkError;
  }

  if (!response.ok) {
    const message = await response.text();
    logger.warn('ApiService', 'request:failed', {
      path,
      method,
      status: response.status,
      statusText: response.statusText,
      body: message,
    });
    throw new Error(message || '요청에 실패했습니다.');
  }

  const data = (await response.json()) as TResponse;
  logger.debug('ApiService', 'request:success', { path, method, status: response.status });
  return data;
}

export const ApiService = {
  getStories(level?: string) {
    const query = level && level !== 'ALL' ? `?level=${level}` : '';
    return request<StorySummary[]>(`/stories${query}`);
  },
  getStoryById(id: string) {
    return request<EpisodeDetailResponse>(`/stories/${encodeURIComponent(id)}`);
  },
  getWordsByEpisode(episodeId: string) {
    const query = new URLSearchParams({ episodeId }).toString();
    return request(`/words?${query}`);
  },
  saveEpisodeProgress(payload: {
    episodeId: string;
    completed: boolean;
    score: number;
    playPositionMs: number;
  }) {
    return request('/progress/episode', { method: 'POST', body: payload, requiresAuth: true });
  },
  saveWordProgress(payload: {
    wordId: string;
    easiness: number;
    intervalDays: number;
    repetitions: number;
    correct: boolean;
  }) {
    return request('/progress/word', { method: 'POST', body: payload, requiresAuth: true });
  },
  getReviewWords() {
    return request('/progress/review', { requiresAuth: true });
  },
  createQuizAttempt(quizId: string) {
    return request<QuizAttemptResponse>('/quiz/attempts', {
      method: 'POST',
      body: { quizId },
      requiresAuth: true,
    });
  },
  submitQuizAttempt(
    attemptId: string,
    payload: {
      responses: { questionId: string; response: unknown; isCorrect: boolean }[];
      score: number;
    },
  ) {
    return request<QuizSubmissionResponse>(`/quiz/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: payload,
      requiresAuth: true,
    });
  },
  saveRecording(payload: {
    episodeId: string;
    storagePath: string;
    durationMs: number;
    score: number;
  }) {
    return request('/recordings', { method: 'POST', body: payload, requiresAuth: true });
  },
  get<TResponse>(path: string, options?: Omit<RequestOptions<unknown>, 'method' | 'body'>) {
    return request<TResponse>(path, options);
  },
  post<TResponse, TBody>(path: string, body: TBody, options?: Omit<RequestOptions<TBody>, 'method' | 'body'>) {
    return request<TResponse, TBody>(path, {
      ...options,
      method: 'POST',
      body,
    });
  },
};

export { request, SUPABASE_ANON_KEY };


