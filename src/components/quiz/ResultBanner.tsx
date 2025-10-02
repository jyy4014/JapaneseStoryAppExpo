import React from 'react';
import { StyleSheet, View } from 'react-native';
import Typography from '../common/Typography';
import StyledButton from '../common/StyledButton';
import { colors } from '../../theme/colors';

interface ResultBannerProps {
  score: number;
  total: number;
  correctCount: number;
  onRetry?: () => void;
  onClose?: () => void;
}

function ResultBanner({ score, total, correctCount, onRetry, onClose }: ResultBannerProps) {
  return (
    <View style={styles.container}>
      <Typography variant="title" color={colors.primary}>
        퀴즈 결과
      </Typography>
      <Typography variant="subtitle" style={styles.score}>
        {score}점 ({correctCount} / {total})
      </Typography>
      <Typography variant="body" color={colors.textSecondary}>
        복습이 필요한 단어를 확인해 보세요.
      </Typography>
      <View style={styles.actions}>
        <StyledButton title="다시 풀기" onPress={onRetry ?? (() => {})} />
        <StyledButton title="닫기" onPress={onClose ?? (() => {})} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  score: {
    marginTop: 4,
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
});

export default ResultBanner;

