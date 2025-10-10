import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import StoryDetailScreen from '../screens/StoryDetailScreen';
import QuizScreen from '../screens/QuizScreen';
import ProgressDashboardScreen from '../screens/ProgressDashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReviewScheduleScreen from '../screens/ReviewScheduleScreen';
import AuthLandingScreen from '../screens/auth/AuthLandingScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import useAuthStore from '../store/useAuthStore';
import { useAuthBootstrap } from '../hooks/useAuthActions';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Home: undefined;
  StoryDetail: { storyId: string };
  Quiz: { episodeId: string };
  ProgressDashboard: undefined;
  Settings: undefined;
  ReviewSchedule: undefined;
  AuthLanding: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { idToken, isInitializing } = useAuthStore();
  useAuthBootstrap();

  if (isInitializing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
        <Stack.Screen name="ProgressDashboard" component={idToken ? ProgressDashboardScreen : AuthLandingScreen} />
        <Stack.Screen name="Settings" component={idToken ? SettingsScreen : AuthLandingScreen} />
        <Stack.Screen name="ReviewSchedule" component={idToken ? ReviewScheduleScreen : AuthLandingScreen} />
        <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default AppNavigator;

