import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Typography from '../components/common/Typography';
import StyledButton from '../components/common/StyledButton';
import StoryCard from '../components/common/StoryCard';
import WordChip from '../components/common/WordChip';
import useStoryStore from '../store/useStoryStore';
import { colors } from '../theme/colors';
import { ApiService } from '../services/api';
import type { RootStackParamList } from '../navigation/AppNavigator';

const levelFilters: Array<typeof useStoryStore.initialState.selectedLevel> = ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'];

function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { stories, selectedLevel, isLoading, error, setStories, setSelectedLevel, setLoading, setError } =
    useStoryStore((state) => ({
      stories: state.stories,
      selectedLevel: state.selectedLevel,
      isLoading: state.isLoading,
      error: state.error,
      setStories: state.setStories,
      setSelectedLevel: state.setSelectedLevel,
      setLoading: state.setLoading,
      setError: state.setError,
    }));

  useEffect(() => {
    let cancelled = false;

    const fetchStories = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const response = await ApiService.getStories(selectedLevel === 'ALL' ? undefined : selectedLevel);
        if (!cancelled) {
          setStories(response);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : '사연을 불러오지 못했습니다.');
          setStories([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStories();

    return () => {
      cancelled = true;
    };
  }, [selectedLevel, setError, setLoading, setStories]);

  const filteredStories = useMemo(() => {
    return stories;
  }, [stories]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="title" color={colors.primary}>
          사연으로 배우는 일본어
        </Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
          스토리를 들으며 자연스럽게 단어를 학습해보세요.
        </Typography>
        <View style={styles.actions}>
          <StyledButton title="학습 현황" onPress={() => navigation.navigate('ProgressDashboard')} />
          <StyledButton title="설정" onPress={() => navigation.navigate('Settings')} variant="secondary" />
        </View>
      </View>

      <View style={styles.levelFilterRow}>
        <Typography variant="subtitle">학습 레벨</Typography>
        <FlatList
          data={levelFilters}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.levelChips}
          renderItem={({ item }) => (
            <WordChip
              label={item}
              color={item === selectedLevel ? colors.primary : colors.muted}
              textColor={item === selectedLevel ? colors.white : colors.textPrimary}
              onPress={() => setSelectedLevel(item)}
            />
          )}
        />
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredStories}
          keyExtractor={(story) => story.id}
          contentContainerStyle={styles.storyList}
          renderItem={({ item }) => (
            <StoryCard
              title={item.title}
              summary={item.summary}
              level={item.level}
              durationSeconds={item.durationSeconds}
              onPress={() => navigation.navigate('StoryDetail', { storyId: item.id })}
            />
          )}
          ListEmptyComponent={
            <Typography variant="body" color={colors.textSecondary} style={styles.emptyState}>
              아직 준비된 사연이 없습니다.
            </Typography>
          }
        />
      )}

      {!!error && (
        <Typography variant="caption" color={colors.secondary} style={styles.errorText}>
          {error}
        </Typography>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 24,
  },
  subtitle: {
    marginTop: 8,
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  levelFilterRow: {
    marginTop: 24,
  },
  levelChips: {
    marginTop: 12,
    gap: 8,
    paddingRight: 20,
  },
  storyList: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    textAlign: 'center',
    paddingVertical: 40,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 12,
  },
});

export default HomeScreen;

