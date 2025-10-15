import React, { useMemo } from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Typography from '../components/common/Typography';
import StyledButton from '../components/common/StyledButton';
import WordChip from '../components/common/WordChip';
import { colors } from '../theme/colors';
import useStoryStore, { StoryLevel } from '../store/useStoryStore';
import type { RootStackParamList } from '../navigation/AppNavigator';

const LEVEL_DESCRIPTIONS: Record<StoryLevel, { title: string; description: string }> = {
  N5: {
    title: 'N5 • 기초 회화',
    description: '히라가나/가타카나와 기초 문형을 복습하고 싶은 학습자에게 적합해요.',
  },
  N4: {
    title: 'N4 • 생활 일본어',
    description: '일상 회화와 기본 문법을 스토리를 통해 자연스럽게 익혀요.',
  },
  N3: {
    title: 'N3 • 실전 문법',
    description: '장문과 다양한 표현을 청취하며 중급 어휘를 확장해요.',
  },
  N2: {
    title: 'N2 • 뉴스/칼럼',
    description: '다양한 주제를 다루는 심화 스토리로 듣기와 독해를 강화해요.',
  },
  N1: {
    title: 'N1 • 심층 토론',
    description: '추상적이고 전문적인 주제를 다루며 고급 어휘에 익숙해져요.',
  },
};

type Navigation = NativeStackNavigationProp<RootStackParamList>;

function LevelSelectionScreen() {
  const navigation = useNavigation<Navigation>();
  const stories = useStoryStore((state) => state.stories);

  const levelCounts = useMemo(() => {
    return stories.reduce<Record<StoryLevel, number>>((acc, story) => {
      acc[story.level] = (acc[story.level] ?? 0) + 1;
      return acc;
    }, {
      N5: 0,
      N4: 0,
      N3: 0,
      N2: 0,
      N1: 0,
    });
  }, [stories]);

  const levels: StoryLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Typography variant="title">학습 난이도를 선택하세요</Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
          현재 실력에 맞는 스토리를 추천해 드릴게요. 나중에 언제든 변경할 수 있어요.
        </Typography>
      </View>

      <FlatList
        data={levels}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const info = LEVEL_DESCRIPTIONS[item];
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Typography variant="subtitle">{info.title}</Typography>
                <WordChip
                  label={`${levelCounts[item]}편`}
                  color={colors.primary}
                  textColor={colors.white}
                />
              </View>
              <Typography variant="body" color={colors.textSecondary} style={styles.description}>
                {info.description}
              </Typography>
              <StyledButton
                title="에피소드 보기"
                onPress={() => navigation.navigate('EpisodeList', { level: item })}
              />
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    marginVertical: 12,
  },
});

export default LevelSelectionScreen;


