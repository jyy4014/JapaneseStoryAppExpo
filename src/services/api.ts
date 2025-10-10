import Constants from 'expo-constants';
import useAuthStore from '../store/useAuthStore';

const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "https://asia-northeast3-jpanstudy.cloudfunctions.net/api";

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

  if (requiresAuth && !idToken) {
    throw new Error('로그인이 필요합니다.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(requiresAuth && idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || '요청에 실패했습니다.');
  }

  return (await response.json()) as TResponse;
}

export const ApiService = {
  getStories(level?: string) {
    const query = level ? `?level=${level}` : '';
    return request(`/api/stories${query}`);
  },
  getStoryById(id: string) {
    return request(`/api/stories/${id}`);
  },
  getWordsByEpisode(episodeId: string) {
    return request(`/api/words?episodeId=${episodeId}`);
  },
  saveEpisodeProgress(payload: {
    episodeId: string;
    completed: boolean;
    score: number;
    playPositionMs: number;
  }) {
    return request('/api/progress/episode', { method: 'POST', body: payload, requiresAuth: true });
  },
  saveWordProgress(payload: {
    wordId: string;
    easiness: number;
    intervalDays: number;
    repetitions: number;
    correct: boolean;
  }) {
    return request('/api/progress/word', { method: 'POST', body: payload, requiresAuth: true });
  },
  getReviewWords() {
    return request('/api/progress/review', { requiresAuth: true });
  },
  createQuizAttempt(quizId: string) {
    return request('/api/quiz/attempts', {
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
    return request(`/api/quiz/attempts/${attemptId}/submit`, {
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
    return request('/api/recordings', { method: 'POST', body: payload, requiresAuth: true });
  },
  get<TResponse>(path: string) {
    return request<TResponse>(path);
  },
};

export { request };


