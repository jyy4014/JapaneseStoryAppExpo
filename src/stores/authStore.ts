import { create } from 'zustand'

interface AuthState {
  user: { id: string; email?: string } | null
  isLoading: boolean
  setUser: (user: AuthState['user']) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  reset: () => set({ user: null, isLoading: false }),
}))




