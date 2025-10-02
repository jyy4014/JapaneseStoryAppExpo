import { useCallback } from 'react';
import { create } from 'zustand';
import type { ProgressSummary, ContinueEpisode, ReviewWord } from '../services/progressApi';
import { fetchContinueEpisodes, fetchProgressSummary, fetchReviewWords } from '../services/progressApi';

interface ProgressState {
  summary: ProgressSummary | null;
  continueEpisodes: ContinueEpisode[];
  reviewWords: ReviewWord[];
  isLoading: boolean;
  error?: string;
  loadDashboard: () => Promise<void>;
  refreshReviewWords: (limit?: number) => Promise<void>;
  reset: () => void;
}

const initialState: Omit<ProgressState, 'loadDashboard' | 'refreshReviewWords' | 'reset'> = {
  summary: null,
  continueEpisodes: [],
  reviewWords: [],
  isLoading: false,
  error: undefined,
};

const useProgressStoreBase = create<ProgressState>((set) => ({
  ...initialState,
  loadDashboard: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const [summary, continueEpisodes, reviewWords] = await Promise.all([
        fetchProgressSummary(),
        fetchContinueEpisodes(),
        fetchReviewWords(),
      ]);
      set({ summary, continueEpisodes, reviewWords, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '학습 현황을 불러오지 못했습니다.',
        isLoading: false,
      });
    }
  },
  refreshReviewWords: async (limit = 10) => {
    try {
      const reviewWords = await fetchReviewWords(limit);
      set({ reviewWords });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '복습 단어를 불러오지 못했습니다.' });
    }
  },
  reset: () => set({ ...initialState }),
}));

export default function useProgressStore() {
  const store = useProgressStoreBase();
  const loadDashboard = useCallback(() => store.loadDashboard(), [store]);
  return { ...store, loadDashboard };
}
