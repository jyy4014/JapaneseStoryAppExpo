import { create } from 'zustand';
import { ApiService, StorySummary, StoryLevel } from '../services/api';

interface StoryState {
  // 상태
  stories: StorySummary[];
  selectedLevel: StoryLevel | 'ALL';
  isLoading: boolean;
  error: string | null;

  // 액션
  setStories: (stories: StorySummary[]) => void;
  setSelectedLevel: (level: StoryLevel | 'ALL') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 비동기 액션
  fetchStories: (level?: StoryLevel | 'ALL') => Promise<void>;
  initialize: () => Promise<void>;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  // 초기 상태
  stories: [],
  selectedLevel: 'ALL',
  isLoading: false,
  error: null,

  // 기본 액션
  setStories: (stories) => set({ stories }),
  setSelectedLevel: (level) => set({ selectedLevel: level }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // 스토리 목록 조회
  fetchStories: async (level = 'ALL') => {
    try {
      // 입력 검증
      if (level && !['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].includes(level)) {
        throw new Error('유효하지 않은 레벨입니다.');
      }

      set({ isLoading: true, error: null });

      const stories = await ApiService.getStories(level === 'ALL' ? undefined : level as any);

      // 데이터 검증
      if (!Array.isArray(stories)) {
        throw new Error('스토리 데이터 형식이 올바르지 않습니다.');
      }

      set({
        stories,
        selectedLevel: level,
        isLoading: false,
        error: null
      });

      console.log('[useStoryStore] fetchStories success:', stories.length, 'stories');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '스토리 목록을 불러오는데 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
        stories: [] // 에러 시 빈 배열로 초기화
      });
      console.error('[useStoryStore] fetchStories error:', error);
    }
  },

  // 초기화
  initialize: async () => {
    try {
      console.log('[useStoryStore] Initializing...');
      await get().fetchStories('ALL');
    } catch (error) {
      console.error('[useStoryStore] Initialization failed:', error);
      // 초기화 실패해도 앱은 계속 실행
      set({
        error: '초기 데이터 로딩에 실패했습니다. 다시 시도해주세요.',
        isLoading: false
      });
    }
  },
}));

// 초기화 실행
useStoryStore.getState().initialize();
