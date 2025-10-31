import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { colors } from '../theme/colors';

// 스크린들 임포트
import HomeScreen from '../screens/HomeScreen';
import StoryDetailScreen from '../screens/StoryDetailScreen';

// 타입 정의
export type RootStackParamList = {
  Home: undefined;
  StoryDetail: { storyId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  console.log('[AppNavigator] Initializing...');

  return (
    <NavigationContainer
      onStateChange={(state) => {
        console.log('[Navigation] State changed:', state?.routes?.map(r => ({
          name: r.name,
          params: r.params
        })));
      }}
    >
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShown: true,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '사연으로 배우는 일본어',
          }}
        />
        <Stack.Screen
          name="StoryDetail"
          component={StoryDetailScreen}
          options={{
            title: '스토리 상세',
            presentation: 'card',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;


