import React, { useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';
import Typography from '../components/common/Typography';
import StyledButton from '../components/common/StyledButton';
import ReviewCalendar from '../components/review/ReviewCalendar';
import ReviewWordCard from '../components/review/ReviewWordCard';
import useReviewScheduleStore from '../store/useReviewScheduleStore';
import { colors } from '../theme/colors';

function getWeekRange(date: string) {
  const start = dayjs(date).startOf('week');
  const end = dayjs(date).endOf('week');
  return { from: start.format('YYYY-MM-DD'), to: end.format('YYYY-MM-DD') };
}

const ReviewScheduleScreen = () => {
  const { summary, schedule, selectedDate, isLoading, error, loadSchedule, selectDate } =
    useReviewScheduleStore();

  useEffect(() => {
    const { from, to } = getWeekRange(dayjs().format('YYYY-MM-DD'));
    loadSchedule(from, to);
  }, [loadSchedule]);

  const selectedWords = useMemo(() => {
    return schedule.find((item) => item.date === selectedDate)?.words ?? [];
  }, [schedule, selectedDate]);

  const handleSelectDate = (date: string) => {
    selectDate(date);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Typography variant="title" style={styles.title}>
          복습 일정
        </Typography>
        <Typography variant="body" color={colors.textSecondary}>
          예정된 복습 단어를 확인하고 학습을 시작하세요.
        </Typography>

        {error ? (
          <View style={styles.errorBanner}>
            <Typography variant="body" color={colors.secondary}>
              {error}
            </Typography>
            <StyledButton title="다시 시도" onPress={() => loadSchedule(...Object.values(getWeekRange(selectedDate)))} />
          </View>
        ) : null}

        {summary ? (
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Typography variant="body">오늘</Typography>
              <Typography variant="title">{summary.totalDueToday}개</Typography>
            </View>
            <View style={styles.summaryCard}>
              <Typography variant="body">이번 주</Typography>
              <Typography variant="title">{summary.dueThisWeek}개</Typography>
            </View>
            <View style={styles.summaryCard}>
              <Typography variant="body">연체</Typography>
              <Typography variant="title" color={colors.secondary}>
                {summary.overdueCount}개
              </Typography>
            </View>
          </View>
        ) : null}

        <ReviewCalendar schedule={schedule} selectedDate={selectedDate} onSelectDate={handleSelectDate} />

        <View style={styles.sectionHeader}>
          <Typography variant="subtitle">
            {dayjs(selectedDate).format('MM월 DD일')} 복습 단어 ({selectedWords.length}개)
          </Typography>
          <StyledButton title="복습 시작" onPress={() => {}} variant="secondary" />
        </View>

        {isLoading && selectedWords.length === 0 ? (
          <Typography variant="body" color={colors.textSecondary}>
            로딩 중...
          </Typography>
        ) : (
          selectedWords.map((word) => (
            <ReviewWordCard key={word.id} word={word} onStartReview={() => {}} />
          ))
        )}
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
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  errorBanner: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ReviewScheduleScreen;

