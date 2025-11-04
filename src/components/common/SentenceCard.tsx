import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, radii, spacing, typography } from '../../constants/theme'
import type { BaseComponentProps } from '../../types/dto/ui'
import type { Sentence } from '../../types/dto'

interface SentenceCardProps extends BaseComponentProps {
  sentence: Sentence
  showNumber?: boolean
  showTime?: boolean
  showPlayButton?: boolean
  showSaveButton?: boolean
  onPlayPress?: (sentence: Sentence) => void
  onSavePress?: (sentence: Sentence) => void
  variant?: 'default' | 'compact'
}

export function SentenceCard({
  sentence,
  showNumber = true,
  showTime = false,
  showPlayButton = false,
  showSaveButton = false,
  onPlayPress,
  onSavePress,
  variant = 'default'
}: SentenceCardProps) {
  const formatTime = (ms: number | null) => {
    if (!ms) return '0:00'
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const isCompact = variant === 'compact'

  return (
    <View style={[styles.card, isCompact && styles.compactCard]}>
      {showNumber && (
        <View style={styles.number}>
          <Text style={styles.numberText}>{sentence.seq ?? '-'}</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.text, isCompact && styles.compactText]}>
          {sentence.text ?? ''}
        </Text>

        {showTime && (
          <Text style={styles.time}>
            {formatTime(sentence.startMs)} - {formatTime(sentence.endMs)}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {showPlayButton && onPlayPress && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onPlayPress(sentence)}
          >
            <Ionicons name="play-circle" size={20} color={lavenderPalette.primary} />
            {!isCompact && <Text style={styles.iconLabel}>듣기</Text>}
          </TouchableOpacity>
        )}

        {showSaveButton && onSavePress && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onSavePress(sentence)}
          >
            <Ionicons name="add-circle-outline" size={20} color={lavenderPalette.primary} />
            {!isCompact && <Text style={styles.iconLabel}>저장</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: lavenderPalette.surface,
    borderWidth: 1,
    borderColor: '#E5DCF9',
    gap: spacing.sm,
  },
  compactCard: {
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  number: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: lavenderPalette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 12,
    fontWeight: '700',
    color: lavenderPalette.surface,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  text: {
    ...typography.body,
    color: lavenderPalette.text,
    lineHeight: 22,
  },
  compactText: {
    fontSize: 14,
    lineHeight: 20,
  },
  time: {
    ...typography.bodySmall,
    color: lavenderPalette.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: '#F3EBFF',
  },
  iconLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: lavenderPalette.primaryDark,
  },
})
