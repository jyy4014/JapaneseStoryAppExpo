import { useEffect, useMemo, useState } from 'react'
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { EpisodeCard } from '../../components/episodes/EpisodeCard'
import { EpisodeFilter } from '../../components/episodes/EpisodeFilter'
import { debugAuthConfig } from '../../config/debug'
import { lavenderPalette, spacing, typography } from '../../constants/theme'
import { useAuthStore } from '../../stores/authStore'
import { useEpisodesStore } from '../../stores/episodesStore'
import { mockEpisodeStats } from '../../mock/episodes'
import type { Episode } from '../../types/episode'

export default function HomeScreen() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const { episodes, loading, error, fetchEpisodes, refreshEpisodes, lastUpdated } = useEpisodesStore()
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null)
  const [showingDate] = useState(() => new Date())

  useEffect(() => {
    if (!user && debugAuthConfig.useMockAuth) {
      setUser(debugAuthConfig.mockUser)
    }
  }, [user, setUser])

  useEffect(() => {
    if (user) {
      fetchEpisodes({ difficulty: selectedDifficulty ?? undefined })
    }
  }, [user, selectedDifficulty, fetchEpisodes])

  const subtitleText = useMemo(() => {
    if (!lastUpdated) return '오늘의 추천 에피소드를 골라보세요.'
    const formatted = new Date(lastUpdated).toLocaleTimeString()
    return `${formatted} 기준으로 업데이트되었습니다.`
  }, [lastUpdated])

  const quickActions = useMemo(
    () => [
      { label: '랜덤 재생', icon: 'shuffle-outline' as const },
      { label: '내 단어장', icon: 'book-outline' as const },
      { label: '복습 일정', icon: 'alarm-outline' as const },
      { label: 'AI 피드백', icon: 'sparkles-outline' as const },
    ],
    [],
  )

  const inProgressEpisode = useMemo(
    () => episodes.find((ep) => ep.progress && !ep.progress.completed),
    [episodes],
  )

  const featuredEpisodes = useMemo(() => episodes.slice(0, 3), [episodes])

  if (!user) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text style={styles.title}>로그인이 필요해요</Text>
        <Text style={styles.subtitle}>연보라 이야기 공간을 즐기려면 먼저 계정으로 로그인해주세요.</Text>
      </SafeAreaView>
    )
  }

  const handleEpisodePress = (episodeId: number) => {
    router.push(`/episode/${episodeId}`)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refreshEpisodes({ difficulty: selectedDifficulty ?? undefined })} />}
      >
        <HeaderBlock subtitle={subtitleText} date={showingDate} />

        <StatHighlights />

        <EpisodeFilter selectedDifficulty={selectedDifficulty} onDifficultyChange={setSelectedDifficulty} />

        <QuickActions quickActions={quickActions} />

        {inProgressEpisode ? <ContinueListening episode={inProgressEpisode} onPress={handleEpisodePress} /> : null}

        {featuredEpisodes.length > 0 ? (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>오늘의 추천</Text>
            <Text style={styles.sectionCount}>{featuredEpisodes.length}편</Text>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>전체 에피소드</Text>
          <Text style={styles.sectionCount}>{episodes.length}편</Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>에피소드를 불러오지 못했어요.</Text>
            <Text style={styles.errorDescription}>네트워크 연결을 확인한 뒤 다시 시도해주세요.</Text>
          </View>
        ) : null}

        <View style={styles.episodeList}>
          {episodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} onPress={() => handleEpisodePress(episode.id)} />
          ))}
        </View>

        {!loading && episodes.length === 0 && !error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>아직 준비된 에피소드가 없어요</Text>
            <Text style={styles.emptyDescription}>필터를 조정하거나 잠시 후 다시 확인해보세요.</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: lavenderPalette.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: lavenderPalette.text,
  },
  sectionCount: {
    ...typography.body,
    color: lavenderPalette.primaryDark,
  },
  errorCard: {
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: '#FCE8EF',
    borderWidth: 1,
    borderColor: '#F5C6D6',
    gap: spacing.xs,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C65385',
  },
  errorDescription: {
    ...typography.body,
    color: '#9C3F67',
  },
  episodeList: {
    gap: spacing.md,
  },
  emptyState: {
    padding: spacing.lg,
    borderRadius: 24,
    backgroundColor: lavenderPalette.surface,
    borderWidth: 1,
    borderColor: '#E6DFF6',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.titleMedium,
    color: lavenderPalette.text,
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    textAlign: 'center',
  },
})

function HeaderBlock({ subtitle, date }: { subtitle: string; date: Date }) {
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }), [])
  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.date}>{dateFormatter.format(date)}</Text>
      <Text style={headerStyles.title}>어서 와요, 오늘도 연보라빛 청취를 시작해볼까요?</Text>
      <Text style={headerStyles.subtitle}>{subtitle}</Text>
    </View>
  )
}

function StatHighlights() {
  const { streakDays, weeklyMinutes, srsDue } = mockEpisodeStats
  return (
    <View style={statStyles.container}>
      <View style={statStyles.primaryCard}>
        <Text style={statStyles.primaryLabel}>연속 학습</Text>
        <Text style={statStyles.primaryValue}>{streakDays}일째</Text>
        <Text style={statStyles.primaryCaption}>연보라빛 루틴이 이어지고 있어요!</Text>
      </View>
      <View style={statStyles.secondaryColumn}>
        <View style={statStyles.secondaryCard}>
          <Ionicons name="time-outline" size={18} color={lavenderPalette.primaryDark} />
          <View>
            <Text style={statStyles.secondaryLabel}>이번 주 학습</Text>
            <Text style={statStyles.secondaryValue}>{weeklyMinutes}분</Text>
          </View>
        </View>
        <View style={statStyles.secondaryCard}>
          <Ionicons name="flash-outline" size={18} color={lavenderPalette.primaryDark} />
          <View>
            <Text style={statStyles.secondaryLabel}>복습 예정 단어</Text>
            <Text style={statStyles.secondaryValue}>{srsDue}개</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

function QuickActions({ quickActions }: { quickActions: { label: string; icon: keyof typeof Ionicons.glyphMap }[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={quickActionStyles.container}>
      {quickActions.map((action) => (
        <TouchableOpacity key={action.label} activeOpacity={0.85} style={quickActionStyles.button}>
          <Ionicons name={action.icon} size={20} color={lavenderPalette.primaryDark} />
          <Text style={quickActionStyles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

function ContinueListening({ episode, onPress }: { episode: Episode; onPress: (id: number) => void }) {
  const progressPercent = episode.progress ? Math.round((episode.progress.current_position_ms / episode.duration_ms) * 100) : 0
  return (
    <TouchableOpacity style={continueStyles.container} activeOpacity={0.88} onPress={() => onPress(episode.id)}>
      <View style={continueStyles.iconCircle}>
        <Ionicons name="play" size={22} color={lavenderPalette.surface} />
      </View>
      <View style={continueStyles.content}>
        <Text style={continueStyles.heading}>이어 듣기</Text>
        <Text style={continueStyles.title} numberOfLines={1}>
          {episode.title}
        </Text>
        <View style={continueStyles.progressBar}>
          <View style={[continueStyles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={continueStyles.caption}>진행률 {progressPercent}%</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={lavenderPalette.primaryDark} />
    </TouchableOpacity>
  )
}

const headerStyles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: spacing.lg,
    backgroundColor: lavenderPalette.primary,
    shadowColor: '#2D1F55',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8f3ff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    ...typography.body,
    color: '#f3e9ff',
  },
})

const statStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: spacing.lg,
    backgroundColor: lavenderPalette.surface,
    borderWidth: 1,
    borderColor: '#D8CAEF',
    gap: spacing.xs,
  },
  primaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: lavenderPalette.primaryDark,
  },
  primaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: lavenderPalette.text,
  },
  primaryCaption: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
  },
  secondaryColumn: {
    width: 140,
    gap: spacing.sm,
  },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.lg,
    backgroundColor: lavenderPalette.surface,
    borderWidth: 1,
    borderColor: '#E5DBF7',
  },
  secondaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: lavenderPalette.text,
  },
  secondaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: lavenderPalette.primaryDark,
  },
})

const quickActionStyles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.lg,
    backgroundColor: lavenderPalette.surface,
    borderWidth: 1,
    borderColor: '#E6DFF6',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: lavenderPalette.text,
  },
})

const continueStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: spacing.lg,
    backgroundColor: lavenderPalette.surface,
    borderWidth: 1,
    borderColor: '#DAD0F3',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lavenderPalette.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  heading: {
    fontSize: 12,
    fontWeight: '700',
    color: lavenderPalette.primaryDark,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: lavenderPalette.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E7DEF7',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: lavenderPalette.primary,
  },
  caption: {
    fontSize: 12,
    color: lavenderPalette.textSecondary,
  },
})



