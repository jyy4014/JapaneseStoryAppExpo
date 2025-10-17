import { create } from 'zustand';

export type StoryLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface StorySummary {
  id: string;
  title: string;
  level: StoryLevel;
  durationSeconds?: number;
  summary?: string;
  thumbnailUrl?: string;
  audioStoragePath?: string;
}

type StoryState = {
  stories: StorySummary[];
  isLoading: boolean;
  error?: string;
  selectedLevel: StoryLevel | 'ALL';
  setStories: (stories: StorySummary[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (message?: string) => void;
  setSelectedLevel: (level: StoryLevel | 'ALL') => void;
};

const initialState = {
  stories: [],
  isLoading: false,
  error: undefined,
  selectedLevel: 'ALL' as StoryLevel | 'ALL',
};

const useStoryStore = Object.assign(
  create<StoryState>((set) => ({
    ...initialState,
    setStories: (stories) => set({ stories }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setSelectedLevel: (level) => set({ selectedLevel: level }),
  })),
  { initialState },
);

export default useStoryStore;


