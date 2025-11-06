import { ApiClient } from './apiClient'

export interface StreakData {
  currentStreak: number
  lastCompletedDate: string | null
  todayMinutes: number
  goalMinutes: number
  goalAchieved: boolean
}

export interface ProfileData {
  id: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
  currentStreak: number
  lastCompletedDate: string | null
  createdAt: string
  updatedAt: string
}

export class UserService {
  /**
   * Get user profile including streak information
   */
  static async getProfile(userId: string): Promise<{ data: ProfileData | null; error: any }> {
    return ApiClient.get<{ profile: ProfileData }>(`/settings/profile`, { userId })
      .then((result) => {
        if (result.error) {
          return { data: null, error: result.error }
        }
        return { data: result.data?.profile || null, error: null }
      })
      .catch((error) => ({ data: null, error }))
  }

  /**
   * Update daily goal progress and streak
   */
  static async updateDailyGoalProgress(userId: string): Promise<{ data: StreakData | null; error: any }> {
    return ApiClient.post<{ streak: StreakData }>(`/settings/streak`, undefined, { userId })
      .then((result) => {
        if (result.error) {
          return { data: null, error: result.error }
        }
        return { data: result.data?.streak || null, error: null }
      })
      .catch((error) => ({ data: null, error }))
  }
}

