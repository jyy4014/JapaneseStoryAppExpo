import { useEffect, useMemo, useState, useCallback } from 'react'
import { SafeAreaView, StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, spacing, typography } from '../../constants/theme'
import { EpisodeFilter } from '../../components/episodes/EpisodeFilter'
import { EpisodeList } from '../../components/episodes/EpisodeList'
import { GuideItem } from '../../components/common/GuideItem'
import { SectionBlock } from '../../components/common/SectionBlock'
import { useEpisodesStore } from '../../stores/episodesStore'
import { useAuthStore } from '../../stores/authStore'
import { UserService } from '../../services/userService'
import { debugAuthConfig } from '../../config/debug'
import type { Episode } from '../../types/dto'

export default function HomeScreen() {
  const router = useRouter()
  const { episodes, loading, error, fetchEpisodes, refreshEpisodes } = useEpisodesStore()
  const { user, setUser, updateStreak } = useAuthStore()
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null)
  const [streakLoading, setStreakLoading] = useState(false)

  useEffect(() => {
    // 개발 환경에서만 모크 사용자 사용
    if (!user && debugAuthConfig.useMockAuth) {
      setUser({ id: debugAuthConfig.mockUser.id })
    }
  }, [user, setUser])

  // Load profile and streak on mount
  useEffect(() => {
    if (user?.id) {
      loadProfile()
      updateStreakProgress()
    }
  }, [user?.id])

  // Update streak progress periodically (when episodes are loaded)
  useEffect(() => {
    if (user?.id && episodes.length > 0) {
      updateStreakProgress()
    }
  }, [user?.id, episodes.length])

  const loadProfile = async () => {
    if (!user?.id) return

    if (__DEV__) {
      console.log('[HomeScreen] Loading profile for user:', user.id)
    }
    try {
      const { data, error } = await UserService.getProfile(user.id)
      if (error) {
        if (__DEV__) {
          console.error('[HomeScreen] Failed to load profile:', error)
        }
        return
      }
      if (data) {
        if (__DEV__) {
          console.log('[HomeScreen] Profile loaded:', { currentStreak: data.currentStreak, lastCompletedDate: data.lastCompletedDate })
        }
        setUser({
          ...user,
          currentStreak: data.currentStreak,
          lastCompletedDate: data.lastCompletedDate,
        })
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[HomeScreen] Failed to load profile:', error)
      }
    }
  }

  const updateStreakProgress = async () => {
    if (!user?.id || streakLoading) return

    if (__DEV__) {
      console.log('[HomeScreen] Updating streak progress for user:', user.id)
    }
    setStreakLoading(true)
    try {
      const { data, error } = await UserService.updateDailyGoalProgress(user.id)
      if (error) {
        if (__DEV__) {
          console.error('[HomeScreen] Failed to update streak:', error)
        }
        return
      }
      if (data) {
        if (__DEV__) {
          console.log('[HomeScreen] Streak updated:', { currentStreak: data.currentStreak, lastCompletedDate: data.lastCompletedDate })
        }
        updateStreak(data.currentStreak, data.lastCompletedDate)
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[HomeScreen] Failed to update streak:', error)
      }
    } finally {
      setStreakLoading(false)
    }
  }

  useEffect(() => {
    fetchEpisodes(
      selectedDifficulty != null
        ? { difficulty: selectedDifficulty }
        : undefined,
      user?.id,
    )
  }, [fetchEpisodes, selectedDifficulty, user?.id])

  const handleEpisodePress = useCallback(
    (episode: Episode) => {
      router.push({ pathname: '/episode/[id]', params: { id: episode.id } })
    },
    [router],
  )

  const handleRefresh = useCallback(() => {
    refreshEpisodes(
      selectedDifficulty != null
        ? { difficulty: selectedDifficulty }
        : undefined,
      user?.id,
    )
  }, [refreshEpisodes, selectedDifficulty, user?.id])

  const headerComponent = useMemo(
    () => (
      <View style={styles.headerContainer}>
        {user?.currentStreak && user.currentStreak > 0 && (
          <View style={styles.streakCard}>
            <Ionicons name="flame" size={24} color={lavenderPalette.primary} />
            <Text style={styles.streakText}>
              {user.currentStreak}일 연속 학습 중!
            </Text>
          </View>
        )}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>와, 오늘도 이야기 한 컵 어떠세요?</Text>
          <Text style={styles.heroSubtitle}>
            원어민 속도로 듣고, 문장을 따라 하며 자연스럽게 일본어에 익숙해져 보세요.
          </Text>
          <View style={styles.heroMeta}>
            <MetaChip icon="layers-outline" label="JLPT 맞춤" />
            <MetaChip icon="time-outline" label="15분 학습" />
            <MetaChip icon="sparkles-outline" label="AI 피드백" />
          </View>
        </View>

        <EpisodeFilter
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
        />

        <SectionBlock title="학습 가이드">
          <View style={styles.guideGrid}>
            <GuideItem icon="ear-outline" title="섀도잉" description="짧은 구간을 반복해서 따라 읽어요." variant="compact" />
            <GuideItem icon="create-outline" title="노트" description="궁금한 표현은 메모로 정리해요." variant="compact" />
            <GuideItem icon="sparkles-outline" title="AI 피드백" description="발음 교정을 위한 피드백을 준비 중이에요." variant="compact" />
          </View>
        </SectionBlock>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘의 추천</Text>
        </View>
      </View>
    ),
    [selectedDifficulty, user?.currentStreak],
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={lavenderPalette.primary} />
        }
      >
        {headerComponent}
        <EpisodeList
          episodes={episodes}
          onEpisodePress={handleEpisodePress}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
          refreshing={loading}
          hasMore={false}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

function MetaChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon} size={16} color={lavenderPalette.primaryDark} />
      <Text style={styles.metaChipText}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: lavenderPalette.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  heroCard: {
    backgroundColor: lavenderPalette.surface,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#221947',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  heroTitle: {
    ...typography.titleMedium,
    fontSize: 24,
    color: lavenderPalette.text,
  },
  heroSubtitle: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
  },
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    backgroundColor: lavenderPalette.primaryLight,
  },
  metaChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: lavenderPalette.primaryDark,
  },
  guideGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: lavenderPalette.text,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: lavenderPalette.primaryLight,
    borderRadius: spacing.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  streakText: {
    ...typography.titleMedium,
    fontSize: 16,
    fontWeight: '600',
    color: lavenderPalette.primaryDark,
  },
})

