import React, { useMemo } from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Typography from '../components/common/Typography';
import StoryCard from '../components/common/StoryCard';
import { colors } from '../theme/colors';
import useStoryStore, { StoryLevel } from '../store/useStoryStore';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'EpisodeList'>;

function EpisodeListScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { level } = route.params;
  const stories = useStoryStore((state) => state.stories);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => story.level === level);
  }, [stories, level]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Typography variant="title">{level} 레벨 에피소드</Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
          관심 있는 스토리를 골라 듣고, 단어 학습과 퀴즈로 실력을 확인하세요.
        </Typography>
      </View>

      <FlatList
        data={filteredStories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <StoryCard
            title={item.title}
            summary={item.summary}
            level={item.level}
            durationSeconds={item.durationSeconds}
            thumbnailUrl={item.thumbnailUrl}
            onPress={() => navigation.navigate('StoryDetail', { storyId: item.id })}
          />
        )}
        ListEmptyComponent={
          <Typography variant="body" color={colors.textSecondary} style={styles.emptyText}>
            아직 준비된 에피소드가 없습니다.
          </Typography>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
  },
});

export type EpisodeListParams = {
  level: StoryLevel;
};

export default EpisodeListScreen;



