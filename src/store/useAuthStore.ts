import { create } from 'zustand';

type AuthTokens = {
  idToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // epoch milliseconds
};

type AuthState = AuthTokens & {
  setTokens: (payload: AuthTokens) => void;
  clearTokens: () => void;
};

const initialState: AuthTokens = {
  idToken: null,
  refreshToken: null,
  expiresAt: null,
};

const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setTokens: ({ idToken, refreshToken, expiresAt }) =>
    set({ idToken, refreshToken, expiresAt }),
  clearTokens: () => set({ ...initialState }),
}));

export default useAuthStore;


