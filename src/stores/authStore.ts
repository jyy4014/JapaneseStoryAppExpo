import { create } from 'zustand'

interface AuthState {
  user: { id: string; email?: string; currentStreak?: number; lastCompletedDate?: string | null } | null
  isLoading: boolean
  setUser: (user: AuthState['user']) => void
  setLoading: (loading: boolean) => void
  updateStreak: (streak: number, lastCompletedDate?: string | null) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  updateStreak: (streak, lastCompletedDate) =>
    set((state) => ({
      user: state.user ? { ...state.user, currentStreak: streak, lastCompletedDate } : null,
    })),
  reset: () => set({ user: null, isLoading: false }),
}))




