import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import StyledButton from '../../components/common/StyledButton';
import Typography from '../../components/common/Typography';
import TextInputField from '../../components/common/TextInputField';
import InfoBanner from '../../components/common/InfoBanner';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import useAuthActions from '../../hooks/useAuthActions';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUpScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signUp } = useAuthActions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!EMAIL_REGEX.test(email)) {
      setError('올바른 이메일을 입력해주세요.');
      return false;
    }
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email, password);
      navigation.navigate('Home');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '회원가입에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Typography variant="title" style={styles.title}>
          일본어 학습 여정을 시작해요!
        </Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
          계정을 만들고 학습 진척도, 복습 일정 등 개인화 서비스를 이용하세요.
        </Typography>

        {error ? <InfoBanner message={error} variant="error" style={styles.banner} /> : null}

        <View style={styles.form}>
          <TextInputField
            label="이메일"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
          />
          <TextInputField
            label="비밀번호"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="******"
          />
          <TextInputField
            label="비밀번호 확인"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="******"
          />
        </View>

        <StyledButton title="회원가입" onPress={handleSubmit} disabled={isSubmitting} />

        <View style={styles.footer}>
          <Typography variant="body" color={colors.textSecondary}>
            이미 계정이 있으신가요?
          </Typography>
          <StyledButton title="로그인" variant="secondary" onPress={() => navigation.navigate('SignIn')} />
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
    gap: 24,
  },
  title: {
    marginTop: 12,
  },
  subtitle: {},
  form: {
    gap: 16,
  },
  banner: {
    marginTop: 12,
  },
  footer: {
    marginTop: 24,
    gap: 8,
  },
});

export default SignUpScreen;

