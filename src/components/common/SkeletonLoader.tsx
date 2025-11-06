import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Dimensions } from 'react-native'
import { lavenderPalette, spacing } from '../../constants/theme'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

interface SkeletonLoaderProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: any
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    )
    animation.start()

    return () => animation.stop()
  }, [animatedValue])

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: lavenderPalette.primaryLight,
          opacity,
        },
        style,
      ]}
    />
  )
}

interface EpisodeCardSkeletonProps {
  count?: number
}

export function EpisodeCardSkeleton({ count = 3 }: EpisodeCardSkeletonProps) {
  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          {/* 썸네일 스켈레톤 */}
          <SkeletonLoader width={72} height={72} borderRadius={8} />
          
          {/* 콘텐츠 영역 */}
          <View style={styles.skeletonContent}>
            <SkeletonLoader width="80%" height={20} borderRadius={4} style={styles.skeletonTitle} />
            <SkeletonLoader width="60%" height={16} borderRadius={4} style={styles.skeletonDescription} />
            
            {/* 진행률 바 스켈레톤 */}
            <View style={styles.skeletonProgressContainer}>
              <SkeletonLoader width="100%" height={4} borderRadius={2} style={styles.skeletonProgressBar} />
              <SkeletonLoader width={35} height={11} borderRadius={2} />
            </View>
            
            {/* 메타 정보 스켈레톤 */}
            <View style={styles.skeletonMetaRow}>
              <SkeletonLoader width={50} height={20} borderRadius={10} />
              <SkeletonLoader width={40} height={16} borderRadius={4} />
              <SkeletonLoader width={50} height={16} borderRadius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

interface SentenceSkeletonProps {
  count?: number
}

export function SentenceSkeleton({ count = 5 }: SentenceSkeletonProps) {
  return (
    <View style={styles.sentenceSkeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.sentenceSkeletonCard}>
          <SkeletonLoader width="90%" height={32} borderRadius={8} style={styles.sentenceSkeletonText} />
          <SkeletonLoader width="70%" height={24} borderRadius={8} style={styles.sentenceSkeletonText} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  skeletonContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: lavenderPalette.surface,
    borderRadius: spacing.lg,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#221947',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  skeletonContent: {
    flex: 1,
    gap: spacing.sm,
  },
  skeletonTitle: {
    marginBottom: spacing.xs,
  },
  skeletonDescription: {
    marginBottom: spacing.xs,
  },
  skeletonProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  skeletonProgressBar: {
    flex: 1,
  },
  skeletonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sentenceSkeletonContainer: {
    paddingVertical: SCREEN_HEIGHT * 0.3,
    paddingHorizontal: spacing.lg,
    paddingBottom: SCREEN_HEIGHT * 0.3 + spacing.xl * 2,
    gap: spacing.lg,
  },
  sentenceSkeletonCard: {
    minHeight: 150,
    padding: spacing.xl,
    borderRadius: spacing.lg,
    backgroundColor: lavenderPalette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sentenceSkeletonText: {
    alignSelf: 'center',
  },
})

