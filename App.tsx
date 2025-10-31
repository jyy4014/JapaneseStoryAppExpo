import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  console.log('[App] Component rendering started');

// 글로벌 에러 핸들링
useEffect(() => {
  const handleError = (error: ErrorEvent) => {
    console.error('[Global] Unhandled error:', error.error);

    // 사용자에게 에러 알림 (개발 환경에서만)
    if (__DEV__) {
      alert(`오류가 발생했습니다: ${error.error?.message || '알 수 없는 오류'}`);
    }
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('[Global] Unhandled promise rejection:', event.reason);

    // Promise rejection을 처리된 것으로 표시
    event.preventDefault();

    // 사용자에게 에러 알림 (개발 환경에서만)
    if (__DEV__) {
      const reason = event.reason instanceof Error ? event.reason.message : '알 수 없는 오류';
      alert(`비동기 작업에서 오류가 발생했습니다: ${reason}`);
    }
  };

  // React 에러 바운더리 대체
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError.apply(console, args);

    // React 에러 감지 및 처리
    const errorMessage = args.join(' ');
    if (errorMessage.includes('Warning:') && !errorMessage.includes('ReactDOMTestUtils')) {
      // React 경고는 무시
      return;
    }

    if (__DEV__ && (errorMessage.includes('Error:') || errorMessage.includes('TypeError'))) {
      console.warn('[Global] Detected potential React error');
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
    };
  }
}, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

