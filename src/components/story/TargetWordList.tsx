import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Typography from '../common/Typography';
import WordChip from '../common/WordChip';
import { colors } from '../../theme/colors';

export interface TargetWord {
  id: string;
  kanji?: string;
  kana?: string;
  meaningKo: string;
}

interface TargetWordListProps {
  title?: string;
  words: TargetWord[];
}

function TargetWordList({ title = '학습 단어', words }: TargetWordListProps) {
  return (
    <View style={styles.container}>
      <Typography variant="subtitle" style={styles.heading}>
        {title}
      </Typography>
      <FlatList
        data={words}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
        renderItem={({ item }) => (
          <WordChip
            label={item.kanji ?? item.kana ?? item.meaningKo}
            color={colors.secondary}
            textColor={colors.textPrimary}
          />
        )}
        ListEmptyComponent={
          <Typography variant="body" color={colors.textSecondary}>
            등록된 학습 단어가 없습니다.
          </Typography>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  heading: {
    marginBottom: 12,
  },
  chipList: {
    gap: 12,
    paddingRight: 20,
  },
});

export default TargetWordList;

