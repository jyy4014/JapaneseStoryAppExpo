import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl as string | undefined ?? 'https://yzcscpcrakpdfsvluyej.supabase.co';
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw';

const SUPABASE_FUNCTIONS_URL = Constants.expoConfig?.extra?.supabaseFunctionsUrl as string | undefined;

const API_BASE_URL = SUPABASE_FUNCTIONS_URL
  ? `${SUPABASE_FUNCTIONS_URL.replace(/\/$/, '')}/api`
  : 'https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api';

// 타입 정의
export type StoryLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface StorySummary {
  id: string;
  title: string;
  summary?: string;
  level: StoryLevel;
  durationSeconds?: number;
  published: boolean;
}

export interface EpisodeDetailResponse {
  id: string;
  title: string;
  level: StoryLevel;
  summary?: string;
  duration_seconds?: number;
  script?: string;
  episode_sentences?: Array<{
    id: string;
    seq_no: number;
    text: string;
    start_ms?: number;
    end_ms?: number;
    translation_ko?: string;
  }>;
  episode_target_words?: Array<{
    word_id: string;
    required_occurrences?: number;
    words?: {
      id: string;
      kanji?: string;
      kana?: string;
      meaning_ko?: string;
      jlpt_level?: string;
    };
  }>;
  audio_assets?: Array<{
    id: string;
    asset_type?: string;
    storage_path?: string;
    duration_ms?: number;
    is_tts?: boolean;
    created_at?: string;
  }>;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<Body> {
  method?: HttpMethod;
  body?: Body;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

// HTTP 요청 함수
async function request<TResponse, TBody = unknown>(
  path: string,
  { method = 'GET', body, headers = {}, requiresAuth = false }: RequestOptions<TBody> = {},
): Promise<TResponse> {
  console.log('[ApiService] ===== REQUEST START =====');
  console.log('[ApiService] Input path:', path);
  console.log('[ApiService] API_BASE_URL:', API_BASE_URL);

  let response: Response;

  try {
    // 입력 검증
    if (!path || typeof path !== 'string') {
      throw new Error('유효하지 않은 API 경로입니다.');
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${normalizedPath}`;
    console.log('[ApiService] Final Request URL:', url);

    // URL 유효성 검사
    try {
      new URL(url);
    } catch {
      throw new Error(`유효하지 않은 URL입니다: ${url}`);
    }

    const authHeaders: Record<string, string> = {};
    if (SUPABASE_ANON_KEY) {
      authHeaders.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
      console.log('[ApiService] Using anon key for auth');
    }

    console.log('[ApiService] Making fetch request');

    // 네트워크 타임아웃 설정 (10초)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...headers,
        },
        ...(body && { body: JSON.stringify(body) }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          throw new Error('네트워크 요청이 시간 초과되었습니다.');
        }
        if (fetchError.message.includes('fetch')) {
          throw new Error('네트워크 연결을 확인해주세요.');
        }
      }
      throw fetchError;
    }

    clearTimeout(timeoutId);
    console.log('[ApiService] Response status:', response.status);

    if (!response.ok) {
      let errorText = '알 수 없는 서버 오류';
      try {
        errorText = await response.text();
      } catch {
        // 응답 본문을 읽을 수 없는 경우
      }

      console.error('[ApiService] Request failed:', errorText);

      // 상태 코드별 에러 메시지
      switch (response.status) {
        case 400:
          throw new Error('잘못된 요청입니다. 입력값을 확인해주세요.');
        case 401:
          throw new Error('인증이 필요합니다.');
        case 403:
          throw new Error('접근 권한이 없습니다.');
        case 404:
          throw new Error('요청한 리소스를 찾을 수 없습니다.');
        case 429:
          throw new Error('너무 많은 요청입니다. 잠시 후 다시 시도해주세요.');
        case 500:
          throw new Error('서버 내부 오류가 발생했습니다.');
        case 502:
        case 503:
        case 504:
          throw new Error('서버가 응답하지 않습니다. 잠시 후 다시 시도해주세요.');
        default:
          throw new Error(`API 요청 실패: ${response.status} ${errorText}`);
      }
    }

    // 응답 데이터 파싱
    let data: TResponse;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : ({} as TResponse);
    } catch (parseError) {
      console.error('[ApiService] JSON parse error:', parseError);
      throw new Error('서버 응답을 처리할 수 없습니다.');
    }

    console.log('[ApiService] Request successful');
    return data;

  } catch (error) {
    console.error('[ApiService] Request error:', error);

    // 에러 타입별 처리
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('알 수 없는 오류가 발생했습니다.');
    }
  }
}

// API 함수들
export const ApiService = {
  // 스토리 목록 조회
  async getStories(level?: StoryLevel): Promise<StorySummary[]> {
    try {
      // 레벨 파라미터 검증
      if (level && !['N5', 'N4', 'N3', 'N2', 'N1', 'ALL'].includes(level)) {
        throw new Error('유효하지 않은 JLPT 레벨입니다.');
      }

      const params = level && level !== 'ALL' ? `?level=${level}` : '';
      const data = await request<StorySummary[]>(`/stories${params}`);

      // 응답 데이터 검증
      if (!Array.isArray(data)) {
        throw new Error('스토리 목록 데이터 형식이 올바르지 않습니다.');
      }

      // 각 스토리 데이터 검증
      const validatedData = data.map((story, index) => {
        if (!story || typeof story !== 'object') {
          console.warn(`[ApiService] Invalid story at index ${index}:`, story);
          return null;
        }

        if (!story.id || !story.title) {
          console.warn(`[ApiService] Missing required fields in story ${index}:`, story);
          return null;
        }

        return {
          id: String(story.id),
          title: String(story.title),
          summary: story.summary ? String(story.summary) : undefined,
          level: story.level || 'N5',
          durationSeconds: story.durationSeconds ? Number(story.durationSeconds) : undefined,
          published: Boolean(story.published),
        } as StorySummary;
      }).filter((story): story is StorySummary => story !== null);

      console.log('[ApiService] getStories success:', validatedData.length, 'stories');
      return validatedData;
    } catch (error) {
      console.error('[ApiService] getStories error:', error);
      throw error instanceof Error ? error : new Error('스토리 목록을 불러오는데 실패했습니다.');
    }
  },

  // 스토리 상세 조회
  async getStoryById(id: string): Promise<EpisodeDetailResponse> {
    console.log('[ApiService] getStoryById called', { id });

    // 입력 검증
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error('[ApiService] getStoryById: Invalid id provided');
      throw new Error('유효한 스토리 ID가 필요합니다.');
    }

    try {
      console.log('[ApiService] Making request to /stories/' + id);
      const result = await request<EpisodeDetailResponse>(`/stories/${id.trim()}`);

      // 응답 데이터 검증
      if (!result || typeof result !== 'object') {
        throw new Error('스토리 상세 데이터 형식이 올바르지 않습니다.');
      }

      if (!result.id || !result.title) {
        throw new Error('스토리 필수 정보가 누락되었습니다.');
      }

      console.log('[ApiService] getStoryById success', { hasData: !!result });
      return result;
    } catch (error) {
      console.error('[ApiService] getStoryById failed:', error);
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('존재하지 않는 스토리입니다.');
      }
      throw error instanceof Error ? error : new Error('스토리 상세 정보를 불러오는데 실패했습니다.');
    }
  },

  // TTS 생성
  async generateAudio(payload: {
    episodeId: string;
    language?: string;
    voicePreset?: string;
    speed?: number;
  }) {
    console.log('[ApiService] generateAudio called', payload);

    // 입력 검증
    if (!payload || typeof payload !== 'object') {
      throw new Error('TTS 요청 데이터가 올바르지 않습니다.');
    }

    if (!payload.episodeId || typeof payload.episodeId !== 'string') {
      throw new Error('유효한 에피소드 ID가 필요합니다.');
    }

    if (payload.speed && (payload.speed < 0.5 || payload.speed > 2.0)) {
      throw new Error('속도는 0.5에서 2.0 사이여야 합니다.');
    }

    const supabaseUrl = 'https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api/audio/generate';
    try {
      const result = await request(supabaseUrl, {
        method: 'POST',
        body: payload
      });
      console.log('[ApiService] generateAudio success');
      return result;
    } catch (error) {
      console.error('[ApiService] generateAudio failed:', error);
      throw error instanceof Error ? error : new Error('음성 생성에 실패했습니다.');
    }
  },

  // 일반 HTTP 요청 헬퍼
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

export { request };
