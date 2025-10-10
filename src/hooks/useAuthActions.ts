import { useCallback, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken,
  User,
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import useAuthStore from '../store/useAuthStore';
import { clearStoredAuth, loadAuthTokens, persistAuthTokens } from '../utils/storage';

function mapTokens(user: User | null) {
  if (!user) {
    return {
      idToken: null,
      refreshToken: null,
      expiresAt: null,
    };
  }

  const accessToken = user.stsTokenManager?.accessToken ?? null;
  const refreshToken = user.stsTokenManager?.refreshToken ?? null;
  const expirationTime = user.stsTokenManager?.expirationTime ?? null;

  return {
    idToken: accessToken,
    refreshToken: refreshToken,
    expiresAt: expirationTime,
  };
}

export function useAuthBootstrap() {
  const { setTokens, clearTokens, setInitializing } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: ReturnType<typeof onAuthStateChanged> | null = null;

    const bootstrap = async () => {
      const persisted = await loadAuthTokens();
      if (persisted?.idToken) {
        setTokens(persisted);
      }

      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) {
          return;
        }

        if (!user) {
          clearTokens();
          await clearStoredAuth();
          setInitializing(false);
          return;
        }

        await getIdToken(user, true);
        const tokens = mapTokens(user);
        setTokens(tokens);
        await persistAuthTokens(tokens);
        setInitializing(false);
      });
    };

    bootstrap();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setTokens, clearTokens, setInitializing]);
}

export default function useAuthActions() {
  const { setTokens, clearTokens } = useAuthStore();

  const handleSignUp = useCallback(async (email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const tokens = mapTokens(credential.user);
    setTokens(tokens);
    await persistAuthTokens(tokens);
    return credential.user;
  }, [setTokens]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const tokens = mapTokens(credential.user);
    setTokens(tokens);
    await persistAuthTokens(tokens);
    return credential.user;
  }, [setTokens]);

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
    clearTokens();
    await clearStoredAuth();
  }, [clearTokens]);

  return {
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}

