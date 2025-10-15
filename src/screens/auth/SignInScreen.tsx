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
import useAuthActions, { isFirebaseConfigured } from '../../hooks/useAuthActions';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignInScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn } = useAuthActions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigation.navigate('Home');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Typography variant="title" style={styles.title}>
          다시 만나서 반가워요!
        </Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
          로그인하고 학습 현황과 맞춤 기능을 이어가세요.
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
        </View>

        <StyledButton
          title="로그인"
          onPress={handleSubmit}
          disabled={isSubmitting || !isFirebaseConfigured}
        />

        <View style={styles.footer}>
          <Typography variant="body" color={colors.textSecondary}>
            계정이 없으신가요?
          </Typography>
          <StyledButton title="회원가입하기" variant="secondary" onPress={() => navigation.navigate('SignUp')} />
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

export default SignInScreen;



