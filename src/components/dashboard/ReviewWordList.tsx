import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Typography from '../common/Typography';
import WordChip from '../common/WordChip';
import { colors } from '../../theme/colors';
import type { ReviewWord } from '../../services/progressApi';

interface ReviewWordListProps {
  words: ReviewWord[];
  onPressWord?: (word: ReviewWord) => void;
  onViewAll?: () => void;
}

const ReviewWordList: React.FC<ReviewWordListProps> = ({ words, onPressWord, onViewAll }) => {
  if (words.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Typography variant="body" color={colors.textSecondary}>
          오늘 복습할 단어가 없습니다.
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="subtitle">오늘의 복습 단어</Typography>
        {onViewAll ? <WordChip label="전체 보기" onPress={onViewAll} color={colors.secondary} /> : null}
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={words}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <WordChip
            label={item.kanji ?? item.kana ?? item.meaningKo}
            onPress={() => onPressWord?.(item)}
            color={colors.primary}
            textColor={colors.white}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listContent: {
    gap: 12,
    paddingRight: 12,
  },
  emptyContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
});

export default ReviewWordList;

