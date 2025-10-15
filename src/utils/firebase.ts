import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  type Auth,
  getReactNativePersistence,
} from 'firebase/auth';
import logger from './logger';

const firebaseConfig = Constants.expoConfig?.extra?.firebaseConfig;

const isFirebaseConfigured = Boolean(firebaseConfig?.apiKey);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured && firebaseConfig) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (error) {
      logger.warn('Firebase', 'initializeAuth failed, falling back to getAuth.', error);
      auth = getAuth(app);
    }
  }
} else {
  logger.warn('Firebase', 'Firebase config not provided. Auth features are disabled.');
}

export { app, auth, isFirebaseConfigured };
export default app;

