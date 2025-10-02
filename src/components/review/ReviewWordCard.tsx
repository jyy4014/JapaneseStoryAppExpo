import React from 'react';
import { StyleSheet, View } from 'react-native';
import Typography from '../common/Typography';
import StyledButton from '../common/StyledButton';
import { colors } from '../../theme/colors';
import type { ReviewWord } from '../../services/reviewScheduleApi';

interface ReviewWordCardProps {
  word: ReviewWord;
  onStartReview?: (word: ReviewWord) => void;
}

const ReviewWordCard: React.FC<ReviewWordCardProps> = ({ word, onStartReview }) => {
  return (
    <View style={styles.card}>
      <Typography variant="subtitle">{word.kanji ?? word.kana ?? word.meaningKo}</Typography>
      <Typography variant="body" color={colors.textSecondary}>
        {word.meaningKo}
      </Typography>
      <View style={styles.metaRow}>
        <Typography variant="caption" color={colors.textSecondary}>
          다음 복습: {word.nextReview ?? '미정'}
        </Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          반복: {word.repetitions}회
        </Typography>
      </View>
      <StyledButton title="바로 복습" onPress={() => onStartReview?.(word)} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ReviewWordCard;
