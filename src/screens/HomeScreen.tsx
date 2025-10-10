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
import InfoBanner from '../components/common/InfoBanner';
import useAuthStore from '../store/useAuthStore';
import logger from '../utils/logger';

const levelFilters: Array<typeof useStoryStore.initialState.selectedLevel> = ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'];

function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { idToken } = useAuthStore();
  const stories = useStoryStore((state) => state.stories);
  const selectedLevel = useStoryStore((state) => state.selectedLevel);
  const isLoading = useStoryStore((state) => state.isLoading);
  const error = useStoryStore((state) => state.error);
  const setStories = useStoryStore((state) => state.setStories);
  const setSelectedLevel = useStoryStore((state) => state.setSelectedLevel);
  const setLoading = useStoryStore((state) => state.setLoading);
  const setError = useStoryStore((state) => state.setError);

  useEffect(() => {
    let cancelled = false;

    const fetchStories = async () => {
      logger.debug('HomeScreen', 'fetchStories:start', { selectedLevel });
      setLoading(true);
      setError(undefined);
      try {
        const response = await ApiService.getStories(selectedLevel === 'ALL' ? undefined : selectedLevel);
        if (!cancelled) {
          logger.debug('HomeScreen', 'fetchStories:success', { count: response.length });
          setStories(response);
        }
      } catch (fetchError) {
        if (!cancelled) {
          logger.error('HomeScreen', 'fetchStories:error', fetchError);
          setError(fetchError instanceof Error ? fetchError.message : '사연을 불러오지 못했습니다.');
          setStories([]);
        }
      } finally {
        if (!cancelled) {
          logger.debug('HomeScreen', 'fetchStories:finished');
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
          <StyledButton
            title="학습 현황"
            onPress={() => navigation.navigate(idToken ? 'ProgressDashboard' : 'AuthLanding')}
          />
          <StyledButton
            title="설정"
            onPress={() => navigation.navigate(idToken ? 'Settings' : 'AuthLanding')}
            variant="secondary"
          />
        </View>
      </View>

      {!idToken ? (
        <InfoBanner
          message="로그인하면 학습 현황과 복습 일정을 저장할 수 있어요."
          variant="info"
          style={styles.banner}
        />
      ) : null}

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
  banner: {
    marginTop: 16,
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

