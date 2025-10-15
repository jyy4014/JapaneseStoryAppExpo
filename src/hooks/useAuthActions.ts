import { useCallback, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken,
  User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../utils/firebase';
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

      if (!isFirebaseConfigured || !auth) {
        logger.warn('AuthActions', 'bootstrap:firebaseNotConfigured');
        setInitializing(false);
        return;
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
    if (!isFirebaseConfigured || !auth) {
      logger.warn('AuthActions', 'signUp:firebaseNotConfigured');
      throw new Error('현재 환경에서는 회원가입 기능을 사용할 수 없습니다.');
    }
    logger.debug('AuthActions', 'signUp:start', { email });
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const tokens = mapTokens(credential.user);
    setTokens(tokens);
    await persistAuthTokens(tokens);
    logger.debug('AuthActions', 'signUp:success', { email });
    return credential.user;
  }, [setTokens]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      logger.warn('AuthActions', 'signIn:firebaseNotConfigured');
      throw new Error('현재 환경에서는 로그인 기능을 사용할 수 없습니다.');
    }
    logger.debug('AuthActions', 'signIn:start', { email });
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const tokens = mapTokens(credential.user);
    setTokens(tokens);
    await persistAuthTokens(tokens);
    logger.debug('AuthActions', 'signIn:success', { email });
    return credential.user;
  }, [setTokens]);

  const handleSignOut = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      logger.warn('AuthActions', 'signOut:firebaseNotConfigured');
      clearTokens();
      await clearStoredAuth();
      return;
    }
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

export { isFirebaseConfigured };

