import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, radii, spacing, typography } from '../../constants/theme'

interface EpisodeFilterProps {
  selectedDifficulty: number | null
  onDifficultyChange: (difficulty: number | null) => void
  onOpenFilterSheet?: () => void
}

const difficultyOptions = [
  { value: null, label: '전체' },
  { value: 1, label: '입문' },
  { value: 2, label: '초급' },
  { value: 3, label: '초중급' },
  { value: 4, label: '중급' },
  { value: 5, label: '중상급' },
]

export function EpisodeFilter({ selectedDifficulty, onDifficultyChange, onOpenFilterSheet }: EpisodeFilterProps) {
  const [isExpanded, setExpanded] = useState(false)

  const handleChipPress = (value: number | null) => {
    const nextValue = selectedDifficulty === value ? null : value
    onDifficultyChange(nextValue)
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>오늘 듣고 싶은 난이도는?</Text>
        <TouchableOpacity style={styles.filterButton} onPress={onOpenFilterSheet ?? (() => setExpanded((prev) => !prev))}>
          <Ionicons name="options" size={16} color={lavenderPalette.primaryDark} />
          <Text style={styles.filterButtonText}>필터</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {difficultyOptions.map((option) => {
          const isSelected = selectedDifficulty === option.value
          return (
            <TouchableOpacity
              key={option.label}
              style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
              onPress={() => handleChipPress(option.value)}
              activeOpacity={0.85}
            >
              <Text style={[styles.chipLabel, isSelected ? styles.chipLabelSelected : undefined]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {isExpanded ? (
        <View style={styles.expandedPanel}>
          <Text style={styles.expandedLabel}>카테고리, 장르, 재생 시간 등 상세 필터는 추후 업데이트됩니다.</Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lavenderPalette.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    shadowColor: '#2A1E50',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.titleMedium,
    color: lavenderPalette.text,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: lavenderPalette.primaryLight,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: lavenderPalette.primaryDark,
  },
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  chipUnselected: {
    borderColor: '#E2DAF8',
    backgroundColor: lavenderPalette.surface,
  },
  chipSelected: {
    borderColor: lavenderPalette.primaryDark,
    backgroundColor: lavenderPalette.primary,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: lavenderPalette.textSecondary,
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
  expandedPanel: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: lavenderPalette.primaryLight,
  },
  expandedLabel: {
    ...typography.caption,
    color: lavenderPalette.primaryDark,
  },
})



