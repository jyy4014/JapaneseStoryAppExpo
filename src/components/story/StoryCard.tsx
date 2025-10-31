import React from 'react';
import { View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Typography from '../common/Typography';
import { colors } from '../../theme/colors';

type StoryLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

interface StoryCardProps {
  id: string;
  title: string;
  summary?: string;
  level: StoryLevel;
  durationSeconds?: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

function getLevelColor(level: StoryLevel): string {
  return colors.jlpt[level] || colors.primary;
}

function getLevelStars(level: StoryLevel): string {
  const levelNumber = parseInt(level.replace('N', ''));
  return '⭐'.repeat(6 - levelNumber); // N5=★★★★★, N4=★★★★, ..., N1=★
}

export default function StoryCard({
  id,
  title,
  summary,
  level,
  durationSeconds,
  onPress,
  style,
}: StoryCardProps) {
  const levelColor = getLevelColor(level);
  const stars = getLevelStars(level);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}분`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 16,
          marginVertical: 8,
          marginHorizontal: 16,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          borderWidth: 2,
          borderColor: levelColor,
        },
        style,
      ]}
    >
      {/* 헤더: JLPT 레벨과 별표 */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
      }}>
        <View style={{
          backgroundColor: levelColor,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
        }}>
          <Typography variant="caption" color={colors.white} style={{ fontWeight: 'bold' }}>
            JLPT {level}
          </Typography>
        </View>
        <Typography variant="small" color={levelColor}>
          {stars}
        </Typography>
      </View>

      {/* 제목 */}
      <Typography variant="title" style={{ marginBottom: 8, fontWeight: 'bold' }}>
        {title}
      </Typography>

      {/* 요약 */}
      {summary && (
        <Typography
          variant="body"
          color={colors.textSecondary}
          style={{ marginBottom: 12, lineHeight: 20 }}
          numberOfLines={2}
        >
          {summary}
        </Typography>
      )}

      {/* 푸터: 재생 시간 */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        {durationSeconds && (
          <View style={{
            backgroundColor: colors.backgroundSecondary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}>
            <Typography variant="small" color={colors.textSecondary}>
              🎧 {formatDuration(durationSeconds)}
            </Typography>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}


