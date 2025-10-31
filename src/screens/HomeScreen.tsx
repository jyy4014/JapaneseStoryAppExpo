import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 컴포넌트들
import StoryCard from '../components/story/StoryCard';
import Typography from '../components/common/Typography';
import StyledButton from '../components/common/StyledButton';

// 스토어 & 서비스
import { useStoryStore } from '../store/useStoryStore';
import { StoryLevel } from '../services/api';

// 타입 & 테마
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const levelFilters: Array<StoryLevel | 'ALL'> = ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'];

function LevelFilterChip({
  level,
  isSelected,
  onPress
}: {
  level: StoryLevel | 'ALL';
  isSelected: boolean;
  onPress: () => void;
}) {
  const getChipColor = () => {
    if (level === 'ALL') return colors.primary;
    return colors.jlpt[level as StoryLevel] || colors.primary;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: isSelected ? getChipColor() : colors.backgroundSecondary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 4,
        borderWidth: isSelected ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      <Typography
        variant="caption"
        color={isSelected ? colors.white : colors.text}
        style={{ fontWeight: '600' }}
      >
        {level === 'ALL' ? '전체' : `JLPT ${level}`}
      </Typography>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  // 스토어 상태
  const {
    stories,
    selectedLevel,
    isLoading,
    error,
    fetchStories,
    setSelectedLevel
  } = useStoryStore();

  // 로컬 상태
  const [refreshing, setRefreshing] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    console.log('[HomeScreen] Component mounted, fetching stories...');
    fetchStories();
  }, []);

  // 난이도 필터링 핸들러
  const handleLevelFilter = async (level: StoryLevel | 'ALL') => {
    console.log('[HomeScreen] Level filter changed:', level);
    setSelectedLevel(level);
    await fetchStories(level);
  };

  // 스토리 클릭 핸들러
  const handleStoryPress = (storyId: string) => {
    try {
      console.log('[HomeScreen] Story pressed:', storyId);

      // 입력 검증
      if (!storyId || typeof storyId !== 'string' || storyId.trim() === '') {
        console.error('[HomeScreen] Invalid storyId:', storyId);
        alert('유효한 스토리 ID가 아닙니다.');
        return;
      }

      // 즉각적인 터치 피드백을 위해 약간의 지연
      setTimeout(() => {
        try {
          if (Platform.OS === 'web') {
            // 웹에서는 URL 변경 + state 업데이트
            console.log('[HomeScreen] Web navigation: updating URL and navigating');

            // window 객체 검증
            if (typeof window === 'undefined' || !window.history) {
              throw new Error('브라우저 환경이 올바르지 않습니다.');
            }

            window.history.pushState(null, '', `/story/${storyId}`);

            // React Navigation을 통해 이동
            if (navigation?.navigate) {
              navigation.navigate('StoryDetail', { storyId: storyId.trim() });
            } else {
              throw new Error('네비게이션 객체가 유효하지 않습니다.');
            }
          } else {
            // 네이티브에서는 React Navigation
            if (navigation?.navigate) {
              navigation.navigate('StoryDetail', { storyId: storyId.trim() });
            } else {
              throw new Error('네비게이션 객체가 유효하지 않습니다.');
            }
          }
        } catch (navError) {
          console.error('[HomeScreen] Navigation error:', navError);
          alert('페이지 이동에 실패했습니다. 다시 시도해주세요.');
        }
      }, 100);
    } catch (error) {
      console.error('[HomeScreen] Story press error:', error);
      alert('스토리 선택에 실패했습니다.');
    }
  };

  // 새로고침 핸들러
  const handleRefresh = async () => {
    console.log('[HomeScreen] Refreshing...');
    setRefreshing(true);
    await fetchStories(selectedLevel);
    setRefreshing(false);
  };

  // 필터링된 스토리 목록
  const filteredStories = selectedLevel === 'ALL'
    ? stories
    : stories.filter(story => story.level === selectedLevel);

  console.log('[HomeScreen] Render:', {
    totalStories: stories.length,
    filteredStories: filteredStories.length,
    selectedLevel,
    isLoading,
    hasError: !!error
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Typography variant="h1" style={styles.title}>
          사연으로 배우는 일본어
        </Typography>
        <Typography variant="subtitle" style={styles.subtitle}>
          스토리를 들으며 자연스럽게 단어를 학습해보세요.
        </Typography>
      </View>

      {/* 난이도 필터 */}
      <View style={styles.levelFilterRow}>
        <Typography variant="title" style={styles.filterTitle}>
          난이도 선택
        </Typography>
        <View style={styles.levelChips}>
          {levelFilters.map((level) => (
            <LevelFilterChip
              key={level}
              level={level}
              isSelected={selectedLevel === level}
              onPress={() => handleLevelFilter(level)}
            />
          ))}
        </View>
      </View>

      {/* 학습 현황 배너 */}
      <View style={styles.banner}>
        <Typography variant="subtitle" style={styles.bannerTitle}>
          학습 현황
        </Typography>
        <Typography variant="body" color={colors.textSecondary}>
          로그인하면 학습 현황과 복습 일정을 저장할 수 있어요.
        </Typography>
      </View>

      {/* 오늘의 추천 사연 헤더 */}
      <View style={styles.recommendationHeader}>
        <Typography variant="title" style={styles.recommendationTitle}>
          오늘의 추천 사연
        </Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          새로운 스토리로 학습 동기를 얻어보세요
        </Typography>
      </View>

      {/* 스토리 목록 */}
      <FlatList
        data={filteredStories}
        keyExtractor={(story) => story.id}
        contentContainerStyle={styles.storyList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <StoryCard
            id={item.id}
            title={item.title}
            summary={item.summary}
            level={item.level}
            durationSeconds={item.durationSeconds}
            onPress={() => handleStoryPress(item.id)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 16 }} />
              <Typography variant="body" color={colors.textSecondary}>
                스토리를 불러오는 중...
              </Typography>
              <Typography variant="caption" color={colors.textLight} style={{ marginTop: 8 }}>
                잠시만 기다려주세요
              </Typography>
            </View>
          ) : (
            <View style={styles.empty}>
              <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: 16 }}>
                {error || '아직 준비된 사연이 없습니다.'}
              </Typography>
              {error && (
                <StyledButton
                  title="다시 시도"
                  onPress={() => fetchStories(selectedLevel)}
                  style={styles.retryButton}
                />
              )}
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  levelFilterRow: {
    padding: 20,
    backgroundColor: colors.white,
  },
  filterTitle: {
    marginBottom: 12,
  },
  levelChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  banner: {
    margin: 20,
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  bannerTitle: {
    color: colors.white,
    marginBottom: 4,
  },
  recommendationHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  recommendationTitle: {
    marginBottom: 4,
  },
  storyList: {
    paddingBottom: 40,
  },
  loading: {
    padding: 40,
    alignItems: 'center',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
});