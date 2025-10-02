import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Typography from '../common/Typography';
import StyledButton from '../common/StyledButton';
import { colors } from '../../theme/colors';

interface QuestionCardProps {
  index: number;
  total: number;
  question: string;
  choices?: string[];
  questionType: 'multiple_choice' | 'fill_blank' | 'matching';
  selectedChoice?: string;
  onSelectChoice?: (choice: string) => void;
}

function QuestionCard({ index, total, question, choices = [], questionType, selectedChoice, onSelectChoice }: QuestionCardProps) {
  const isChoiceQuestion = useMemo(() => questionType === 'multiple_choice', [questionType]);

  return (
    <View style={styles.container}>
      <Typography variant="subtitle" color={colors.textSecondary}>
        문제 {index + 1} / {total}
      </Typography>
      <Typography variant="title" style={styles.question}>
        {question}
      </Typography>

      {isChoiceQuestion && (
        <View style={styles.choiceContainer}>
          {choices.map((choice) => {
            const isSelected = selectedChoice === choice;
            return (
              <StyledButton
                key={choice}
                title={choice}
                variant={isSelected ? 'secondary' : 'primary'}
                onPress={() => onSelectChoice?.(choice)}
              />
            );
          })}
        </View>
      )}

      {!isChoiceQuestion && (
        <Typography variant="caption" color={colors.textSecondary}>
          현재 문제 유형은 아직 UI가 준비되지 않았습니다.
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  question: {
    marginTop: 12,
    marginBottom: 16,
  },
  choiceContainer: {
    gap: 12,
  },
});

export default QuestionCard;

