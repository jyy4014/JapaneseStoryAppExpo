import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, radii, spacing, typography } from '../../constants/theme'
import { useEpisodesStore } from '../../stores/episodesStore'
import type { Episode } from '../../types/episode'
import { mockEpisodes } from '../../mock/episodes'

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const episodeId = Number(id)
  const router = useRouter()

  const { episodes, fetchEpisodes } = useEpisodesStore()
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(episodeId)) {
      setError('잘못된 에피소드 요청입니다.')
      setLoading(false)
      return
    }

    async function ensureEpisodes() {
      if (!episodes.length) {
        await fetchEpisodes()
      }
    }

    ensureEpisodes()
  }, [episodeId, episodes.length, fetchEpisodes])

  useEffect(() => {
    let isMounted = true

    async function loadEpisode() {
      setLoading(true)
      setError(null)

      const fromStore = episodes.find((ep) => ep.id === episodeId)
      if (fromStore) {
        if (isMounted) {
          setEpisode(fromStore)
          setLoading(false)
        }
        return
      }

      try {
        const { EpisodeService } = await import('../../services/episodeService')
        const { data, error } = await EpisodeService.getEpisode(episodeId)
        if (error) {
          console.warn('Episode detail fetch failed', error)
        }
        const resolved = data ?? mockEpisodes.find((ep) => ep.id === episodeId) ?? null
        if (isMounted) {
          if (!resolved) {
            setError('해당 에피소드를 찾을 수 없습니다.')
          }
          setEpisode(resolved)
          setLoading(false)
        }
      } catch (err) {
        console.warn('Episode detail load error', err)
        if (isMounted) {
          const fallback = mockEpisodes.find((ep) => ep.id === episodeId) ?? null
          setEpisode(fallback)
          setError(fallback ? '실제 데이터를 불러오지 못해 모의 데이터를 표시합니다.' : '에피소드를 불러오지 못했습니다.')
          setLoading(false)
        }
      }
    }

    if (Number.isFinite(episodeId)) {
      loadEpisode()
    }

    return () => {
      isMounted = false
    }
  }, [episodeId, episodes])

  const difficultyLabel = useMemo(() => mapDifficultyToLabel(episode?.difficulty), [episode?.difficulty])
  const durationMinutes = useMemo(() => Math.max(1, Math.round((episode?.duration_ms ?? 0) / 60000)), [episode?.duration_ms])

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={lavenderPalette.primaryDark} />
        <Text style={styles.loadingText}>에피소드를 불러오는 중입니다…</Text>
      </SafeAreaView>
    )
  }

  if (!episode) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text style={styles.errorHeading}>에피소드를 찾을 수 없어요</Text>
        <Text style={styles.errorBody}>홈 화면으로 돌아가 다른 이야기를 골라볼까요?</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={lavenderPalette.surface} />
          <Text style={styles.backButtonText}>뒤로가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={heroStyles.container}>
          <TouchableOpacity style={heroStyles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={lavenderPalette.surface} />
          </TouchableOpacity>
          <Text style={heroStyles.category}>{episode.genre ?? '라이프'}</Text>
          <Text style={heroStyles.title}>{episode.title}</Text>
          {episode.description ? <Text style={heroStyles.description}>{episode.description}</Text> : null}

          <View style={heroStyles.metaRow}>
            <MetaChip icon="layers-outline" label={difficultyLabel} />
            <MetaChip icon="time-outline" label={`${durationMinutes}분`} />
            {episode.category ? <MetaChip icon="pricetag-outline" label={episode.category} /> : null}
          </View>
        </View>

        {error ? (
          <View style={styles.inlineError}>
            <Ionicons name="alert-circle" size={18} color="#C65385" />
            <Text style={styles.inlineErrorText}>{error}</Text>
          </View>
        ) : null}

        <SectionBlock title="에피소드 소개">
          <Text style={styles.bodyText}>
            이 이야기는 실제 일본 현지 대화 템포를 바탕으로 구성되었어요. 필요한 문장을 북마크하고 단어를 저장해 나만의
            단어장에 추가할 수 있습니다.
          </Text>
        </SectionBlock>

        {episode.sentences && episode.sentences.length > 0 ? (
          <SectionBlock title="대본 미리보기" actionLabel="전체 보기" onAction={() => {}}>
            <View style={sentenceStyles.container}>
              {episode.sentences.map((sentence) => (
                <SentenceCard key={sentence.id} sentence={sentence} />
              ))}
            </View>
          </SectionBlock>
        ) : null}

        <SectionBlock title="학습 가이드">
          <View style={guideStyles.list}>
            <GuideItem icon="ear-outline" title="섀도잉" description="문장을 듣고 따라 읽으며 발음과 리듬을 맞춰보세요." />
            <GuideItem icon="create-outline" title="노트" description="헷갈리는 표현은 메모하고 복습 일정에 추가해요." />
            <GuideItem icon="sparkles-outline" title="AI 피드백" description="향후 업데이트될 발음 피드백 기능을 기대해주세요." />
          </View>
        </SectionBlock>

        <View style={ctaStyles.container}>
          <TouchableOpacity style={ctaStyles.primaryButton} activeOpacity={0.9}>
            <Ionicons name="play" size={20} color={lavenderPalette.surface} />
            <Text style={ctaStyles.primaryLabel}>듣기 시작</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ctaStyles.secondaryButton} activeOpacity={0.85}>
            <Ionicons name="bookmark-outline" size={18} color={lavenderPalette.primaryDark} />
            <Text style={ctaStyles.secondaryLabel}>나중에 듣기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function mapDifficultyToLabel(difficulty?: number | null) {
  if (!difficulty) return '입문'
  const labels = ['입문', '초급', '초중급', '중급', '중상급']
  return labels[Math.max(0, Math.min(labels.length - 1, difficulty - 1))]
}

function MetaChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={metaStyles.chip}>
      <Ionicons name={icon} size={14} color={lavenderPalette.surface} />
      <Text style={metaStyles.chipText}>{label}</Text>
    </View>
  )
}

function SectionBlock({
  title,
  children,
  actionLabel,
  onAction,
}: {
  title: string
  children: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <View style={sectionStyles.container}>
      <View style={sectionStyles.header}>
        <Text style={sectionStyles.title}>{title}</Text>
        {actionLabel && onAction ? (
          <TouchableOpacity style={sectionStyles.actionButton} onPress={onAction} activeOpacity={0.85}>
            <Text style={sectionStyles.actionLabel}>{actionLabel}</Text>
            <Ionicons name="chevron-forward" size={16} color={lavenderPalette.primaryDark} />
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  )
}

function SentenceCard({
  sentence,
}: {
  sentence: Episode['sentences'] extends Array<infer S> ? S : never
}) {
  return (
    <View style={sentenceStyles.card}>
      <Text style={sentenceStyles.text}>{sentence.text}</Text>
      <View style={sentenceStyles.footer}>
        <TouchableOpacity style={sentenceStyles.iconButton}>
          <Ionicons name="play-circle" size={20} color={lavenderPalette.primaryDark} />
          <Text style={sentenceStyles.iconLabel}>이 구간 듣기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={sentenceStyles.iconButton}>
          <Ionicons name="add-circle-outline" size={20} color={lavenderPalette.primaryDark} />
          <Text style={sentenceStyles.iconLabel}>단어 저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function GuideItem({ icon, title, description }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string }) {
  return (
    <View style={guideStyles.item}>
      <View style={guideStyles.iconCircle}>
        <Ionicons name={icon} size={18} color={lavenderPalette.primaryDark} />
      </View>
      <View style={guideStyles.copy}>
        <Text style={guideStyles.title}>{title}</Text>
        <Text style={guideStyles.description}>{description}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: lavenderPalette.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: lavenderPalette.background,
  },
  loadingText: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
  },
  errorHeading: {
    ...typography.titleMedium,
    color: lavenderPalette.text,
  },
  errorBody: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: lavenderPalette.primary,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: lavenderPalette.surface,
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: spacing.lg,
    backgroundColor: '#FCE8EF',
    borderWidth: 1,
    borderColor: '#F6C7D8',
  },
  inlineErrorText: {
    fontSize: 14,
    color: '#9C3F67',
  },
  bodyText: {
    ...typography.body,
    color: lavenderPalette.text,
    lineHeight: 24,
  },
})

const heroStyles = StyleSheet.create({
  container: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: spacing.xl,
    backgroundColor: lavenderPalette.primary,
    gap: spacing.md,
    shadowColor: '#311F61',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F6ECFF',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  description: {
    ...typography.body,
    color: '#f1e7ff',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
})

const metaStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
})

const sectionStyles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: spacing.lg,
    backgroundColor: lavenderPalette.surface,
    borderWidth: 1,
    borderColor: '#E5DCF9',
    gap: spacing.md,
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

const sentenceStyles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: spacing.lg,
    backgroundColor: lavenderPalette.background,
    borderWidth: 1,
    borderColor: '#DED4F3',
    gap: spacing.sm,
  },
  text: {
    ...typography.body,
    color: lavenderPalette.text,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: '#F3EBFF',
  },
  iconLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: lavenderPalette.primaryDark,
  },
})

const guideStyles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: lavenderPalette.background,
    borderWidth: 1,
    borderColor: '#E7DFFC',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: lavenderPalette.text,
  },
  description: {
    fontSize: 13,
    color: lavenderPalette.textSecondary,
    lineHeight: 20,
  },
})

const ctaStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: lavenderPalette.primaryDark,
  },
  primaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: lavenderPalette.surface,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: lavenderPalette.surface,
    borderWidth: 1,
    borderColor: '#D7CCEF',
  },
  secondaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: lavenderPalette.primaryDark,
  },
})


