import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, radii, spacing, typography } from '../../constants/theme'
import type { BaseComponentProps } from '../../types/dto/ui'

interface GuideItemProps extends BaseComponentProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  description: string
  variant?: 'default' | 'compact'
}

export function GuideItem({ icon, title, description, variant = 'default' }: GuideItemProps) {
  const isCompact = variant === 'compact'

  return (
    <View style={[styles.item, isCompact && styles.compactItem]}>
      <View style={[styles.iconCircle, isCompact && styles.compactIconCircle]}>
        <Ionicons
          name={icon}
          size={isCompact ? 16 : 18}
          color={lavenderPalette.primaryDark}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, isCompact && styles.compactTitle]}>{title}</Text>
        <Text style={[styles.description, isCompact && styles.compactDescription]}>
          {description}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: lavenderPalette.surface,
    borderWidth: 1,
    borderColor: '#E7DFFC',
  },
  compactItem: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: lavenderPalette.text,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: lavenderPalette.textSecondary,
    lineHeight: 20,
  },
  compactDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
})
