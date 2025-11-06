import { Image, StyleSheet, Text, TouchableOpacity, View, type TouchableOpacityProps } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Episode } from '../../types/dto'
import { lavenderPalette, radii, spacing, typography } from '../../constants/theme'

interface EpisodeCardProps extends TouchableOpacityProps {
  episode: Episode
}

const difficultyLabels = ['입문', '초급', '초중급', '중급', '중상급']

export function EpisodeCard({ episode, onPress, testID, ...touchableProps }: EpisodeCardProps) {
  const durationSource = episode.durationMs ?? (episode.durationSeconds ? episode.durationSeconds * 1000 : 0)
  const durationMinutes = durationSource ? Math.max(1, Math.round(durationSource / 60000)) : 0
  const difficultyIndex = Math.max(0, Math.min(4, (episode.difficulty ?? 1) - 1))
  const difficultyLabel = difficultyLabels[difficultyIndex]

  // 진행률 계산
  const progress = episode.progress
  const progressPercentage =
    progress && durationSource > 0
      ? Math.min(100, Math.round((progress.currentPositionMs / durationSource) * 100))
      : 0

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.88}
      testID={testID ?? `episode-card-${episode.id}`}
      accessibilityRole="button"
      {...touchableProps}
    >
      <View style={styles.thumbnailWrapper}>
        {episode.thumbnailPath ? (
          <Image source={{ uri: episode.thumbnailPath }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name="musical-notes" size={28} color={lavenderPalette.primaryDark} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {episode.title}
        </Text>
        {episode.summary ? (
          <Text style={styles.description} numberOfLines={2}>
            {episode.summary}
          </Text>
        ) : null}

        {/* 진행률 표시 */}
        {progress && progressPercentage > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>{progressPercentage}%</Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{difficultyLabel}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="time" size={14} color={lavenderPalette.textSecondary} />
            <Text style={styles.metaText}>{durationMinutes}분</Text>
          </View>
          {episode.genre ? (
            <>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons name="sparkles" size={14} color={lavenderPalette.textSecondary} />
                <Text style={styles.metaText}>{episode.genre}</Text>
              </View>
            </>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: lavenderPalette.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#221947',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  thumbnailWrapper: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: lavenderPalette.primaryLight,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    ...typography.titleMedium,
    color: lavenderPalette.text,
  },
  description: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: lavenderPalette.primaryLight,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: lavenderPalette.primaryDark,
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#DED0F4',
    marginHorizontal: spacing.xs / 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: lavenderPalette.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: lavenderPalette.primaryLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: lavenderPalette.primaryDark,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: lavenderPalette.primaryDark,
    minWidth: 35,
  },
})