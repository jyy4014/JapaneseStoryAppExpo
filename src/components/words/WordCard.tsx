import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, radii, spacing, typography } from '../../constants/theme'
import type { BaseComponentProps } from '../../types/dto/ui'

export interface Word {
  id: number
  kanji: string
  kana: string
  romaji: string
  meaning_ko: string
  jlpt_level: number
  frequency_score: number
}

interface WordCardProps extends BaseComponentProps {
  word: Word
  onPress?: () => void
  onSave?: () => void
  isSaved?: boolean
}

export function WordCard({ word, onPress, onSave, isSaved }: WordCardProps) {
  const formatJLPTLevel = (level: number) => {
    const labels = ['N5', 'N4', 'N3', 'N2', 'N1']
    return labels[level - 1] || 'N5'
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{formatJLPTLevel(word.jlpt_level)}</Text>
        </View>
        {onSave && (
          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isSaved ? lavenderPalette.primary : lavenderPalette.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.kanji}>{word.kanji}</Text>
        <Text style={styles.kana}>{word.kana}</Text>
        <Text style={styles.romaji}>{word.romaji}</Text>
        <Text style={styles.meaning}>{word.meaning_ko}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.frequency}>
          <Ionicons name="stats-chart" size={14} color={lavenderPalette.textSecondary} />
          <Text style={styles.frequencyText}>{word.frequency_score.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: lavenderPalette.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5DCF9',
    shadowColor: '#221947',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelBadge: {
    backgroundColor: lavenderPalette.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: lavenderPalette.primaryDark,
  },
  saveButton: {
    padding: spacing.xs,
  },
  content: {
    gap: spacing.xs,
  },
  kanji: {
    ...typography.titleMedium,
    color: lavenderPalette.text,
    fontSize: 18,
  },
  kana: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    fontSize: 14,
  },
  romaji: {
    ...typography.bodySmall,
    color: lavenderPalette.textSecondary,
    fontStyle: 'italic',
  },
  meaning: {
    ...typography.body,
    color: lavenderPalette.text,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  frequency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  frequencyText: {
    fontSize: 12,
    color: lavenderPalette.textSecondary,
  },
})
