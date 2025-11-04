import React from 'react'
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native'
import { lavenderPalette, spacing } from '../../constants/theme'
import type { BaseComponentProps } from '../../types/dto/ui'

interface LayoutProps extends BaseComponentProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  padding?: number
  margin?: number
  backgroundColor?: string
}

export function Layout({
  children,
  header,
  footer,
  padding = spacing.lg,
  margin,
  backgroundColor = lavenderPalette.background
}: LayoutProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <View style={[styles.container, { backgroundColor }]}>
        {header && <View style={styles.header}>{header}</View>}

        <View style={[styles.content, { padding, margin }]}>
          {children}
        </View>

        {footer && <View style={styles.footer}>{footer}</View>}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  footer: {
    zIndex: 10,
  },
})
