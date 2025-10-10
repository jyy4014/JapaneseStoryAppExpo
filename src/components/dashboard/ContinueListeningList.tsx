import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Typography from '../common/Typography';
import StyledButton from '../common/StyledButton';
import { colors } from '../../theme/colors';
import type { ContinueEpisode } from '../../services/progressApi';

interface ContinueListeningListProps {
  episodes: ContinueEpisode[];
  onContinue?: (episodeId: string) => void;
  onViewAll?: () => void;
}

const ContinueListeningList: React.FC<ContinueListeningListProps> = ({ episodes, onContinue, onViewAll }) => {
  if (episodes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Typography variant="body" color={colors.textSecondary}>
          이어 들을 에피소드가 없습니다.
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="subtitle">이어 듣기</Typography>
        {onViewAll ? <StyledButton title="전체 보기" onPress={onViewAll} /> : null}
      </View>
      <FlatList
        data={episodes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const progress = Math.min(item.playPositionMs / item.durationMs, 1);
          return (
            <View style={styles.card}>
              <Typography variant="body" style={styles.title}>
                {item.title}
              </Typography>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { flex: progress }]} />
                <View style={{ flex: 1 - progress }} />
              </View>
              <StyledButton title="이어 듣기" onPress={() => onContinue?.(item.id)} variant="secondary" />
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listContent: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
    overflow: 'hidden',
    marginBottom: 12,
    flexDirection: 'row',
  },
  progressBarFill: {
    backgroundColor: colors.primary,
  },
  emptyContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
});

export default ContinueListeningList;

