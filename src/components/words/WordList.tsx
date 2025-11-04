import React from 'react'
import { FlatList, StyleSheet, View, Text, ActivityIndicator, type FlatListProps } from 'react-native'
import { lavenderPalette, spacing, typography } from '../../constants/theme'
import { WordCard } from './WordCard'
import type { Word } from './WordCard'
interface WordListProps extends Partial<FlatListProps<Word>> {
  words: Word[]
  onWordPress?: (word: Word) => void
  onWordSave?: (word: Word) => void
  savedWordIds?: number[]
  loading?: boolean
  error?: string | null
}

export function WordList({
  words,
  onWordPress,
  onWordSave,
  savedWordIds = [],
  loading = false,
  error,
  onRefresh,
  refreshing = false,
  onEndReached,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  ...flatListProps
}: WordListProps) {
  const renderWord = ({ item }: { item: Word }) => (
    <WordCard
      word={item}
      onPress={() => onWordPress?.(item)}
      onSave={() => onWordSave?.(item)}
      isSaved={savedWordIds.includes(item.id)}
    />
  )

  const keyExtractor = (item: Word) => item.id.toString()

  if (loading && words.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={lavenderPalette.primary} />
        <Text style={styles.loadingText}>단어를 불러오는 중입니다...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <FlatList
      {...flatListProps}
      data={words}
      renderItem={renderWord}
      keyExtractor={keyExtractor}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={ListEmptyComponent || <EmptyWordList />}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={words.length === 0 ? styles.emptyContainer : styles.container}
      showsVerticalScrollIndicator={false}
    />
  )
}

function EmptyWordList() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyText}>학습할 단어가 없습니다</Text>
      <Text style={styles.emptySubtext}>새로운 단어를 검색해보세요</Text>
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
})
