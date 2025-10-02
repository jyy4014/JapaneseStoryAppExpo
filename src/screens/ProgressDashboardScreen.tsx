import React, { useEffect, useMemo } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Typography from '../components/common/Typography';
import StyledButton from '../components/common/StyledButton';
import StatCard from '../components/dashboard/StatCard';
import ReviewWordList from '../components/dashboard/ReviewWordList';
import ContinueListeningList from '../components/dashboard/ContinueListeningList';
import { colors } from '../theme/colors';
import useProgressStore from '../store/useProgressStore';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

function formatMinutes(minutes: number) {
  return `${Math.round(minutes)}분`;
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

const ProgressDashboardScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { summary, continueEpisodes, reviewWords, isLoading, error, loadDashboard, refreshReviewWords } =
    useProgressStore();

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    if (!summary) {
      return [];
    }
    return [
      {
        label: '완료한 에피소드',
        value: `${summary.totalEpisodesCompleted}편`,
      },
      {
        label: '총 청취 시간',
        value: formatMinutes(summary.totalListeningMinutes),
      },
      {
        label: '평균 퀴즈 점수',
        value: formatPercent(summary.averageQuizScore ?? 0),
      },
      {
        label: '연속 학습 일수',
        value: `${summary.streakCount ?? 0}일`,
      },
    ];
  }, [summary]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadDashboard} />}>
        <Typography variant="title" style={styles.title}>
          오늘의 학습 현황
        </Typography>
        <Typography variant="body" color={colors.textSecondary}>
          학습 통계를 확인하고 복습을 이어가세요.
        </Typography>

        {error ? (
          <View style={styles.errorBanner}>
            <Typography variant="body" color={colors.secondary}>
              {error}
            </Typography>
            <StyledButton title="다시 시도" onPress={loadDashboard} style={styles.retryButton} />
          </View>
        ) : null}

        <View style={styles.statGrid}>
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </View>

        <ReviewWordList
          words={reviewWords}
          onPressWord={() => {}}
          onViewAll={() => navigation.navigate('ReviewSchedule')}
        />

        <ContinueListeningList
          episodes={continueEpisodes}
          onContinue={() => {}}
          onViewAll={() => navigation.navigate('ReviewSchedule')}
        />

        <StyledButton title="복습 시작하기" onPress={() => navigation.navigate('ReviewSchedule')} style={styles.bottomButton} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
  },
  errorBanner: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  retryButton: {
    marginTop: 12,
  },
  bottomButton: {
    marginTop: 32,
  },
});

export default ProgressDashboardScreen;
