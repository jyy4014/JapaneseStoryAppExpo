import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, radii, spacing, typography } from '../../constants/theme'
import type { BaseComponentProps } from '../../types/dto/ui'

interface SectionBlockProps extends BaseComponentProps {
  title: string
  children: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  variant?: 'default' | 'elevated'
}

export function SectionBlock({
  title,
  children,
  actionLabel,
  onAction,
  variant = 'default'
}: SectionBlockProps) {
  return (
    <View style={[
      styles.container,
      variant === 'elevated' && styles.elevatedContainer
    ]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {actionLabel && onAction ? (
          <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.85}>
            <Text style={styles.actionLabel}>{actionLabel}</Text>
            <Ionicons name="chevron-forward" size={16} color={lavenderPalette.primaryDark} />
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: lavenderPalette.surface,
    borderWidth: 1,
    borderColor: '#E5DCF9',
    gap: spacing.md,
  },
  elevatedContainer: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.titleMedium,
    color: lavenderPalette.text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: lavenderPalette.primaryDark,
  },
})
