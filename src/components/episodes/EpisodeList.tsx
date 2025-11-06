import React from 'react'
import { FlatList, StyleSheet, View, Text, ActivityIndicator, RefreshControl } from 'react-native'
import { Link } from 'expo-router'
import { lavenderPalette, spacing, typography } from '../../constants/theme'
import { EpisodeCard } from './EpisodeCard'
import { EpisodeCardSkeleton } from '../common/SkeletonLoader'
import type { Episode } from '../../types/dto'
import type { BaseComponentProps } from '../../types/dto/ui'

interface EpisodeListProps extends BaseComponentProps {
  episodes: Episode[]
  onEpisodePress?: (episode: Episode) => void
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  refreshing?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  ListHeaderComponent?: React.ReactElement | null
}

export function EpisodeList({
  episodes,
  onEpisodePress,
  loading = false,
  error,
  onRefresh,
  refreshing = false,
  onLoadMore,
  hasMore = false,
  ListHeaderComponent,
}: EpisodeListProps) {
  const renderEpisode = ({ item }: { item: Episode }) => (
    <Link
      href={{ pathname: '/episode/[id]', params: { id: String(item.id) } }}
      asChild
      onPress={() => onEpisodePress?.(item)}
    >
      <EpisodeCard episode={item} accessibilityLabel={`${item.title} 에피소드 열기`} />
    </Link>
  )

  const keyExtractor = (item: Episode) => item.id.toString()

  const renderFooter = () => {
    if (!hasMore || loading) return null
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={lavenderPalette.primary} />
        <Text style={styles.footerText}>더 많은 에피소드를 불러오는 중...</Text>
      </View>
    )
  }

  if (loading && episodes.length === 0) {
    return <EpisodeCardSkeleton count={5} />
  }

  if (error && episodes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        {onRefresh && (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={lavenderPalette.primary}
          />
        )}
      </View>
    )
  }

  return (
    <FlatList
      data={episodes}
      renderItem={renderEpisode}
      keyExtractor={keyExtractor}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      contentContainerStyle={episodes.length === 0 ? styles.emptyContainer : styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={lavenderPalette.primary}
          />
        ) : undefined
      }
    />
  )
}

function EmptyEpisodeList() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyText}>에피소드를 찾을 수 없습니다</Text>
      <Text style={styles.emptySubtext}>필터를 조정하거나 다시 시도해주세요</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyText: {
    ...typography.titleMedium,
    color: lavenderPalette.text,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  footerText: {
    ...typography.bodySmall,
    color: lavenderPalette.textSecondary,
  },
})
