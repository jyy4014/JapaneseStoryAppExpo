import { useCallback, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import { clearStoredAuth, loadAuthTokens } from '../utils/storage';
import logger from '../utils/logger';
import { isFirebaseConfigured } from '../utils/firebase';

export function useAuthBootstrap() {
  const { setTokens, clearTokens, setInitializing } = useAuthStore();

  useEffect(() => {
    logger.debug('AuthActions', 'bootstrap:start');
    let isMounted = true;
    const bootstrap = async () => {
      const persisted = await loadAuthTokens();
      if (persisted?.idToken) {
        logger.debug('AuthActions', 'bootstrap:foundPersistedToken');
        setTokens(persisted);
      }

      if (!isFirebaseConfigured) {
        logger.warn('AuthActions', 'bootstrap:firebaseDisabled');
      }
      setInitializing(false);
    };

    bootstrap().catch((error) => {
      logger.error('AuthActions', 'bootstrap:error', error);
      setInitializing(false);
    });

    return () => {
      isMounted = false;
    };
  }, [setTokens, clearTokens, setInitializing]);
}

export default function useAuthActions() {
  const { setTokens, clearTokens } = useAuthStore();

  const handleSignUp = useCallback(async (email: string, password: string) => {
    logger.warn('AuthActions', 'signUp:disabled');
    throw new Error('현재 환경에서는 회원가입 기능을 사용할 수 없습니다.');
  }, [setTokens]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    logger.warn('AuthActions', 'signIn:disabled');
    throw new Error('현재 환경에서는 로그인 기능을 사용할 수 없습니다.');
  }, [setTokens]);

  const handleSignOut = useCallback(async () => {
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

