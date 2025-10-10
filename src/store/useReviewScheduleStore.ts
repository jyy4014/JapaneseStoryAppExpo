import { create } from 'zustand';
import dayjs from 'dayjs';
import {
  fetchReviewSchedule,
  fetchReviewSummary,
  type ReviewScheduleEntry,
  type ReviewSummary,
} from '../services/reviewScheduleApi';

interface ReviewScheduleState {
  summary: ReviewSummary | null;
  schedule: ReviewScheduleEntry[];
  selectedDate: string;
  isLoading: boolean;
  error?: string;
  loadSchedule: (from: string, to: string) => Promise<void>;
  refreshSummary: () => Promise<void>;
  selectDate: (date: string) => void;
}

const useReviewScheduleStore = create<ReviewScheduleState>((set, get) => ({
  summary: null,
  schedule: [],
  selectedDate: dayjs().format('YYYY-MM-DD'),
  isLoading: false,
  error: undefined,
  loadSchedule: async (from, to) => {
    set({ isLoading: true, error: undefined });
    try {
      const [schedule, summary] = await Promise.all([fetchReviewSchedule(from, to), fetchReviewSummary()]);
      set({ schedule, summary, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '복습 일정을 불러오지 못했습니다.',
        isLoading: false,
      });
    }
  },
  refreshSummary: async () => {
    try {
      const summary = await fetchReviewSummary();
      set({ summary });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '요약 정보를 갱신하지 못했습니다.' });
    }
  },
  selectDate: (date) => {
    set({ selectedDate: date });
  },
}));

export default useReviewScheduleStore;

