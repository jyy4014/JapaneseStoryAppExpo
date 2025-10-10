import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import Typography from '../../components/common/Typography';
import StyledButton from '../../components/common/StyledButton';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

const AuthLandingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Typography variant="title" style={styles.title}>
          회원가입하고 맞춤 학습을 시작하세요
        </Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
          학습 진행도를 저장하고 복습 일정, 퀴즈 결과 등 개인화된 서비스를 이용하려면 로그인하세요.
        </Typography>

        <View style={styles.buttonGroup}>
          <StyledButton title="로그인" onPress={() => navigation.navigate('SignIn')} />
          <StyledButton title="회원가입" onPress={() => navigation.navigate('SignUp')} variant="secondary" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    marginBottom: 24,
  },
  buttonGroup: {
    gap: 12,
  },
});

export default AuthLandingScreen;

