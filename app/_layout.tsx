import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="index" options={{ title: '사연으로 배우는 일본어' }} />
          <Stack.Screen
            name="episode/[id]"
            options={{
              title: '에피소드 상세',
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="story/[id]"
            options={{
              title: '스토리 상세',
              presentation: 'card',
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
