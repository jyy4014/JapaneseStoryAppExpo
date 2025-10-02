import { create } from 'zustand';
import {
  fetchUserSettings,
  updateUserProfile,
  updateUserPreferences,
  updateUserNotifications,
  type UserSettings,
  type UserPreferences,
  type UserNotifications,
  type UserProfile,
} from '../services/settingsApi';

interface UserSettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  error?: string;
  loadSettings: () => Promise<void>;
  saveProfile: (profile: Partial<UserProfile>) => Promise<void>;
  savePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  saveNotifications: (notifications: Partial<UserNotifications>) => Promise<void>;
}

const useUserSettingsStore = create<UserSettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: undefined,
  loadSettings: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const settings = await fetchUserSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '설정을 불러오지 못했습니다.',
        isLoading: false,
      });
    }
  },
  saveProfile: async (profile) => {
    try {
      await updateUserProfile(profile);
      const current = get().settings;
      if (current) {
        set({ settings: { ...current, profile: { ...current.profile, ...profile } } });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '프로필 저장에 실패했습니다.' });
      throw error;
    }
  },
  savePreferences: async (preferences) => {
    try {
      await updateUserPreferences(preferences);
      const current = get().settings;
      if (current) {
        set({ settings: { ...current, preferences: { ...current.preferences, ...preferences } } });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '환경 설정 저장에 실패했습니다.' });
      throw error;
    }
  },
  saveNotifications: async (notifications) => {
    try {
      await updateUserNotifications(notifications);
      const current = get().settings;
      if (current) {
        set({ settings: { ...current, notifications: { ...current.notifications, ...notifications } } });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '알림 설정 저장에 실패했습니다.' });
      throw error;
    }
  },
}));

export default useUserSettingsStore;
