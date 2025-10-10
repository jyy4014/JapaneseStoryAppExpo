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

const firebaseConfig = Constants.expoConfig?.extra?.firebaseConfig;

if (!firebaseConfig || !firebaseConfig.apiKey) {
  throw new Error('Firebase config가 설정되지 않았습니다. env를 확인하세요.');
}

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let auth: Auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    auth = getAuth(app);
  }
}

export { app, auth };
export default app;

