import React from 'react';
import { View, ScrollView } from 'react-native';
import Typography from '../common/Typography';
import { colors } from '../../theme/colors';

interface TargetWord {
  id: string;
  kanji?: string;
  kana?: string;
  meaningKo?: string;
  jlptLevel?: string;
}

interface TargetWordListProps {
  words: TargetWord[];
}

function WordChip({ word }: { word: TargetWord }) {
  // word 객체 검증
  if (!word || typeof word !== 'object') {
    console.warn('[WordChip] Invalid word prop:', word);
    return (
      <View style={{
        backgroundColor: colors.error,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        margin: 4,
      }}>
        <Typography variant="caption" color={colors.white}>
          단어 데이터 오류
        </Typography>
      </View>
    );
  }

  const displayText = word.kanji
    ? `${word.kanji} (${word.kana || ''})`
    : word.kana || '단어 정보 없음';

  const meaning = word.meaningKo || '의미 미등록';

  return (
    <View style={{
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      margin: 4,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      <Typography variant="caption" style={{ fontWeight: '500' }}>
        {displayText}
      </Typography>
      <Typography variant="small" color={colors.textSecondary} style={{ marginTop: 2 }}>
        {meaning}
      </Typography>
    </View>
  );
}

export default function TargetWordList({ words }: TargetWordListProps) {
  // props 검증
  if (!Array.isArray(words)) {
    console.warn('[TargetWordList] Invalid words prop:', words);
    return (
      <View style={{ padding: 16 }}>
        <Typography variant="body" color={colors.error}>
          단어 데이터를 불러올 수 없습니다.
        </Typography>
      </View>
    );
  }

  if (words.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Typography variant="body" color={colors.textSecondary}>
          타겟 단어가 없습니다.
        </Typography>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 16 }}>
      <Typography variant="title" style={{ marginBottom: 12 }}>
        🎯 타겟 단어
      </Typography>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {words.map((word) => (
          <WordChip key={word.id} word={word} />
        ))}
      </ScrollView>
    </View>
  );
}
