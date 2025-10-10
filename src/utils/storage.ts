import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthTokens } from '../store/useAuthStore';

const AUTH_STORAGE_KEY = '@japaneseStory/authTokens';

export async function persistAuthTokens(tokens: AuthTokens) {
  if (!tokens.idToken) {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
}

export async function loadAuthTokens(): Promise<AuthTokens | null> {
  const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch (error) {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export async function clearStoredAuth() {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}



