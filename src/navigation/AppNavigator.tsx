import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import StoryDetailScreen from '../screens/StoryDetailScreen';
import QuizScreen from '../screens/QuizScreen';
import ProgressDashboardScreen from '../screens/ProgressDashboardScreen';

export type RootStackParamList = {
  Home: undefined;
  StoryDetail: { storyId: string };
  Quiz: { episodeId: string };
  ProgressDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="ProgressDashboard" component={ProgressDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;

