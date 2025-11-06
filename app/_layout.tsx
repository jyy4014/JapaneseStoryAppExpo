import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            animation: Platform.OS === 'web' ? 'slide_from_right' : 'default',
            animationDuration: 300,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="episode/[id]"
            options={{
              title: '에피소드 상세',
              presentation: 'card',
              animation: 'slide_from_right',
              animationDuration: 300,
            }}
          />
          <Stack.Screen
            name="story/[id]"
            options={{
              title: '스토리 상세',
              presentation: 'card',
              animation: 'slide_from_bottom',
              animationDuration: 350,
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
