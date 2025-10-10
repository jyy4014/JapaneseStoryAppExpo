import { create } from 'zustand';

export type AuthTokens = {
  idToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // epoch milliseconds
};

type AuthState = AuthTokens & {
  isInitializing: boolean;
  setTokens: (payload: AuthTokens) => void;
  clearTokens: () => void;
  setInitializing: (value: boolean) => void;
};

const initialState: AuthTokens = {
  idToken: null,
  refreshToken: null,
  expiresAt: null,
};

const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  isInitializing: true,
  setTokens: (payload) =>
    set((state) => ({
      ...state,
      ...payload,
    })),
  clearTokens: () =>
    set((state) => ({
      ...state,
      ...initialState,
    })),
  setInitializing: (value) => set((state) => ({ ...state, isInitializing: value })),
}));

export default useAuthStore;


