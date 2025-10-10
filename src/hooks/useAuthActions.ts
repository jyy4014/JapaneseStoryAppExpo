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
import logger from '../utils/logger';

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
    logger.debug('AuthActions', 'bootstrap:start');
    let isMounted = true;
    let unsubscribe: ReturnType<typeof onAuthStateChanged> | null = null;

    const bootstrap = async () => {
      const persisted = await loadAuthTokens();
      if (persisted?.idToken) {
        logger.debug('AuthActions', 'bootstrap:foundPersistedToken');
        setTokens(persisted);
      }

      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) {
          logger.debug('AuthActions', 'bootstrap:unmounted');
          return;
        }

        if (!user) {
          logger.debug('AuthActions', 'bootstrap:userSignedOut');
          clearTokens();
          await clearStoredAuth();
          setInitializing(false);
          return;
        }

        await getIdToken(user, true);
        const tokens = mapTokens(user);
        logger.debug('AuthActions', 'bootstrap:setTokens', { hasIdToken: !!tokens.idToken });
        setTokens(tokens);
        await persistAuthTokens(tokens);
        setInitializing(false);
      });
    };

    bootstrap().catch((error) => {
      logger.error('AuthActions', 'bootstrap:error', error);
      setInitializing(false);
    });

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
    logger.debug('AuthActions', 'signUp:start', { email });
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const tokens = mapTokens(credential.user);
    setTokens(tokens);
    await persistAuthTokens(tokens);
    logger.debug('AuthActions', 'signUp:success', { email });
    return credential.user;
  }, [setTokens]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    logger.debug('AuthActions', 'signIn:start', { email });
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const tokens = mapTokens(credential.user);
    setTokens(tokens);
    await persistAuthTokens(tokens);
    logger.debug('AuthActions', 'signIn:success', { email });
    return credential.user;
  }, [setTokens]);

  const handleSignOut = useCallback(async () => {
    logger.debug('AuthActions', 'signOut:start');
    await signOut(auth);
    clearTokens();
    await clearStoredAuth();
    logger.debug('AuthActions', 'signOut:success');
  }, [clearTokens]);

  return {
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}

