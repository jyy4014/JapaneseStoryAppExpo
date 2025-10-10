import { ApiService } from './api';

export interface UserProfile {
  email: string;
  displayName?: string;
  preferredLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}

export interface UserPreferences {
  dailyTargetMinutes: number;
  weeklyTargetEpisodes: number;
  theme: 'light' | 'dark';
  language: 'ko' | 'ja' | 'en';
}

export interface UserNotifications {
  reviewReminder: boolean;
  emailUpdates: boolean;
}

export interface UserSettings {
  profile: UserProfile;
  preferences: UserPreferences;
  notifications: UserNotifications;
}

export async function fetchUserSettings(): Promise<UserSettings> {
  return ApiService.get<UserSettings>('/api/users/me', { requiresAuth: true } as never);
}

export async function updateUserProfile(profile: Partial<UserProfile>) {
  return ApiService.post('/api/users/me/profile', profile, { requiresAuth: true } as never);
}

export async function updateUserPreferences(preferences: Partial<UserPreferences>) {
  return ApiService.post('/api/users/me/preferences', preferences, { requiresAuth: true } as never);
}

export async function updateUserNotifications(notifications: Partial<UserNotifications>) {
  return ApiService.post('/api/users/me/notifications', notifications, { requiresAuth: true } as never);
}

