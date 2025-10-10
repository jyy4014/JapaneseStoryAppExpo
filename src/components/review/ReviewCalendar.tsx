import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import Typography from '../common/Typography';
import { colors } from '../../theme/colors';
import type { ReviewScheduleEntry } from '../../services/reviewScheduleApi';

interface ReviewCalendarProps {
  schedule: ReviewScheduleEntry[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function getDates(schedule: ReviewScheduleEntry[], selectedDate: string) {
  const allDates = schedule.map((entry) => entry.date);
  if (!allDates.includes(selectedDate)) {
    allDates.push(selectedDate);
  }
  return allDates
    .map((date) => dayjs(date))
    .sort((a, b) => a.valueOf() - b.valueOf())
    .map((date) => date.format('YYYY-MM-DD'));
}

const ReviewCalendar: React.FC<ReviewCalendarProps> = ({ schedule, selectedDate, onSelectDate }) => {
  const dates = getDates(schedule, selectedDate);

  return (
    <View style={styles.container}>
      <Typography variant="subtitle">복습 일정</Typography>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={dates}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.dateList}
        renderItem={({ item }) => {
          const entry = schedule.find((e) => e.date === item);
          const isSelected = item === selectedDate;
          return (
            <TouchableOpacity
              style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              onPress={() => onSelectDate(item)}>
              <Typography variant="body" style={styles.dateText}>
                {dayjs(item).format('MM/DD')}
              </Typography>
              <Typography variant="caption" color={colors.textSecondary}>
                {entry?.count ?? 0}개
              </Typography>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  dateList: {
    gap: 12,
    marginTop: 12,
  },
  dateCard: {
    width: 80,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  dateCardSelected: {
    backgroundColor: colors.primary,
  },
  dateText: {
    color: colors.textPrimary,
  },
});

export default ReviewCalendar;

