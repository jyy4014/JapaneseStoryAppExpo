import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Typography from './Typography';
import WordChip from './WordChip';

export interface StoryCardProps {
  title: string;
  summary?: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  durationSeconds?: number;
  thumbnailUrl?: string;
  onPress?: () => void;
}

const levelColorMap: Record<StoryCardProps['level'], string> = {
  N5: '#A49EE4',
  N4: '#A49EE4',
  N3: '#A49EE4',
  N2: '#F9D770',
  N1: '#F9D770',
};

function StoryCard({ title, summary, level, durationSeconds, thumbnailUrl, onPress }: StoryCardProps) {
  const minutes = durationSeconds ? Math.ceil(durationSeconds / 60) : undefined;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.thumbnailWrapper}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Typography variant="subtitle" color="#FFFFFF">
              JP
            </Typography>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Typography variant="subtitle" style={styles.title}>
            {title}
          </Typography>
          <WordChip label={level} color={levelColorMap[level]} />
        </View>

        {!!summary && (
          <Typography variant="body" color="#6B7280" numberOfLines={2}>
            {summary}
          </Typography>
        )}

        {minutes !== undefined && (
          <Typography variant="caption" color="#9CA3AF" style={styles.duration}>
            약 {minutes}분 • 오디오 포함
          </Typography>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 16,
  },
  thumbnailWrapper: {
    marginRight: 16,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  thumbnailPlaceholder: {
    backgroundColor: '#C7C4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 12,
  },
  duration: {
    marginTop: 12,
  },
});

export default StoryCard;


