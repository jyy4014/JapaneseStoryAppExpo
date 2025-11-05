import { useCallback, useMemo } from 'react'
import { Alert, ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, spacing, typography } from '../../constants/theme'
import { SectionBlock } from '../../components/common/SectionBlock'
import { SentenceCard } from '../../components/common/SentenceCard'
import { GuideItem } from '../../components/common/GuideItem'
import { EpisodeService } from '../../services/episodeService'
import { EventService } from '../../services/eventService'
import { useEpisodeData } from '../../hooks/useEpisodeData'
import { useAuthStore } from '../../stores/authStore'

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const router = useRouter()
  const { user } = useAuthStore()

  const { episode, loading, error, refresh } = useEpisodeData(id)

  const difficultyLabel = useMemo(() => {
    if (!episode?.difficulty) return '입문'
    const labels = ['입문', '초급', '초중급', '중급', '중상급']
    return labels[Math.max(0, Math.min(labels.length - 1, (episode.difficulty ?? 1) - 1))]
  }, [episode?.difficulty])

  const durationMinutes = useMemo(() => {
    if (!episode?.durationMs && !episode?.durationSeconds) return 0
    const source = episode.durationMs ?? (episode.durationSeconds ? episode.durationSeconds * 1000 : 0)
    return Math.max(1, Math.round(source / 60000))
  }, [episode?.durationMs, episode?.durationSeconds])

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleStartListening = useCallback(async () => {
    if (!episode) return

    // 오디오를 미리 생성/확인
    const { data, error: audioError } = await EpisodeService.getOrGenerateAudio(episode.id)

    if (audioError || !data) {
      Alert.alert('재생할 수 없어요', '오디오를 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.')
      return
    }

    // 플레이어 페이지로 이동
    EventService.logPlayStart(episode.id, 0)
    router.push(`/story/${episode.id}`)
  }, [episode, router])

  const handleSaveForLater = useCallback(() => {
    if (!episode) return
    EventService.logEvent('episode_save_for_later', { episode_id: episode.id, user_id: user?.id }, episode.id)
    Alert.alert('저장 완료', '나중에 듣기 목록에 추가했어요.')
  }, [episode, user?.id])

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={lavenderPalette.primaryDark} />
        <Text style={styles.loadingText}>에피소드 정보를 불러오는 중이에요…</Text>
      </SafeAreaView>
    )
  }

  if (!episode) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text style={styles.errorTitle}>에피소드를 찾을 수 없어요</Text>
        <Text style={styles.errorBody}>{error ?? '이전 화면으로 돌아가 다른 이야기를 선택해 주세요.'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={18} color={lavenderPalette.surface} />
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <TouchableOpacity style={styles.backIcon} onPress={handleBack}>
            <Ionicons name="chevron-back" size={22} color={lavenderPalette.surface} />
          </TouchableOpacity>
          <Text style={styles.genre}>{episode.genre ?? '미분류'}</Text>
          <Text style={styles.title}>{episode.title}</Text>
          {episode.summary ? <Text style={styles.summary}>{episode.summary}</Text> : null}

          <View style={styles.metaRow}>
            <MetaChip icon="layers-outline" label={difficultyLabel} />
            <MetaChip icon="time-outline" label={`${durationMinutes}분`} />
            {episode.category ? <MetaChip icon="pricetag-outline" label={episode.category} /> : null}
          </View>
        </View>

        <SectionBlock title="에피소드 소개">
          <Text style={styles.bodyText}>
            이 에피소드는 자연스러운 일본어 대화를 원어민 속도로 재현한 콘텐츠예요. 중요한 문장을 북마크하고, 궁금한 표현은 단어장에 저장해 반복 학습해 보세요.
          </Text>
        </SectionBlock>

        {episode.sentences && episode.sentences.length > 0 ? (
          <SectionBlock title="대본 미리보기" actionLabel="새로고침" onAction={refresh}>
            <View style={styles.sentenceList}>
              {episode.sentences.map((sentence) => (
                <SentenceCard key={sentence.id} sentence={sentence} showNumber showPlayButton showSaveButton />
              ))}
            </View>
          </SectionBlock>
        ) : null}

        <SectionBlock title="학습 가이드">
          <View style={styles.guideList}>
            <GuideItem icon="ear-outline" title="섀도잉" description="문장을 듣고 따라 하면서 발음과 리듬을 익혀 보세요." />
            <GuideItem icon="create-outline" title="노트 정리" description="궁금한 표현을 메모하고 복습 일정에 추가해 두세요." />
            <GuideItem icon="sparkles-outline" title="AI 피드백" description="향후 업데이트에서 AI 발음 피드백 기능이 제공될 예정이에요." />
          </View>
        </SectionBlock>
      </ScrollView>

      <View style={styles.ctaBar}>
        <TouchableOpacity style={styles.primaryCta} onPress={handleStartListening}>
          <Ionicons name="play" size={20} color={lavenderPalette.surface} />
          <Text style={styles.primaryCtaText}>듣기 시작</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryCta} onPress={handleSaveForLater}>
          <Ionicons name="bookmark-outline" size={18} color={lavenderPalette.primaryDark} />
          <Text style={styles.secondaryCtaText}>나중에 듣기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

function MetaChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon} size={14} color={lavenderPalette.surface} />
      <Text style={styles.metaChipText}>{label}</Text>
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
  hero: {
    backgroundColor: lavenderPalette.primaryDark,
    marginHorizontal: spacing.lg,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  backIcon: {
    alignSelf: 'flex-start',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genre: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: lavenderPalette.surface,
  },
  summary: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  metaChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: lavenderPalette.surface,
  },
  bodyText: {
    ...typography.body,
    color: lavenderPalette.text,
  },
  sentenceList: {
    gap: spacing.sm,
  },
  guideList: {
    gap: spacing.sm,
  },
  ctaBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: lavenderPalette.surface,
    borderTopWidth: 1,
    borderTopColor: '#EBE3FF',
  },
  primaryCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: lavenderPalette.primaryDark,
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
  },
  primaryCtaText: {
    fontSize: 16,
    fontWeight: '700',
    color: lavenderPalette.surface,
  },
  secondaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: lavenderPalette.primaryDark,
  },
  secondaryCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: lavenderPalette.primaryDark,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    marginTop: spacing.md,
  },
  errorTitle: {
    ...typography.titleMedium,
    color: lavenderPalette.text,
    marginBottom: spacing.sm,
  },
  errorBody: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: lavenderPalette.primaryDark,
    borderRadius: spacing.md,
  },
  backButtonText: {
    color: lavenderPalette.surface,
    fontWeight: '600',
  },
})

