import { useCallback, useMemo, useState } from 'react'
import { Alert, ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, spacing, typography } from '../../constants/theme'
import { SectionBlock } from '../../components/common/SectionBlock'
import { SentenceCard } from '../../components/common/SentenceCard'
import { GuideItem } from '../../components/common/GuideItem'
import { EpisodeService } from '../../services/episodeService'
// import { EventService } from '../../services/eventService' // TODO: Edge Functions를 통한 이벤트 로깅으로 변경 필요
import { useEpisodeData } from '../../hooks/useEpisodeData'
import { useAuthStore } from '../../stores/authStore'

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const router = useRouter()
  const { user } = useAuthStore()

  const { episode, loading, error, refresh } = useEpisodeData(id)
  const [preparingAudio, setPreparingAudio] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

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

    try {
      setPreparingAudio(true)
      setAudioError(null)

      console.log('[EpisodeDetail] Preparing audio for episode:', episode.id)

      // 오디오 생성/로드 (3-5초 소요 가능)
      const { data, error } = await EpisodeService.getOrGenerateAudio(episode.id)

      if (error) {
        console.error('[EpisodeDetail] Audio preparation failed:', error)
        setAudioError(error.message ?? '오디오 준비에 실패했어요.')
        return
      }

      if (!data?.audioUrl) {
        console.error('[EpisodeDetail] No audio URL returned')
        setAudioError('오디오를 불러올 수 없어요.')
        return
      }

      console.log('[EpisodeDetail] Audio ready, navigating to player')

      // 오디오 준비 완료 → 플레이어로 이동
      // EventService.logPlayStart(episode.id, 0) // TODO: Edge Functions를 통한 이벤트 로깅
      router.push(`/story/${episode.id}`)
    } catch (err) {
      console.error('[EpisodeDetail] Unexpected error:', err)
      setAudioError('예상치 못한 오류가 발생했어요.')
    } finally {
      setPreparingAudio(false)
    }
  }, [episode, router])

  const handleSaveForLater = useCallback(() => {
    if (!episode) return
    // EventService.logEvent('episode_save_for_later', { episode_id: episode.id, user_id: user?.id }, episode.id) // TODO: Edge Functions
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
        <TouchableOpacity style={styles.primaryCta} onPress={handleStartListening} disabled={preparingAudio}>
          <Ionicons name="play" size={20} color={lavenderPalette.surface} />
          <Text style={styles.primaryCtaText}>듣기 시작</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryCta} onPress={handleSaveForLater}>
          <Ionicons name="bookmark-outline" size={18} color={lavenderPalette.primaryDark} />
          <Text style={styles.secondaryCtaText}>나중에 듣기</Text>
        </TouchableOpacity>
      </View>

      {/* 오디오 준비 중 로딩 모달 */}
      <Modal visible={preparingAudio} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={lavenderPalette.primaryDark} />
            <Text style={styles.modalTitle}>오디오 준비 중</Text>
            <Text style={styles.modalDescription}>처음 재생하는 에피소드는 오디오 생성에 3~5초가 소요돼요.</Text>
            <Text style={styles.modalHint}>잠시만 기다려 주세요! ☕️</Text>
          </View>
        </View>
      </Modal>

      {/* 오디오 준비 실패 Alert */}
      <Modal visible={!!audioError} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="alert-circle-outline" size={48} color={lavenderPalette.error ?? '#E53E3E'} />
            <Text style={styles.modalTitle}>오디오 준비 실패</Text>
            <Text style={styles.modalDescription}>{audioError}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setAudioError(null)
              }}
            >
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: lavenderPalette.surface,
    borderRadius: spacing.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 280,
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    ...typography.h3,
    color: lavenderPalette.text,
    marginTop: spacing.sm,
  },
  modalDescription: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    textAlign: 'center',
  },
  modalHint: {
    ...typography.body,
    color: lavenderPalette.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButton: {
    backgroundColor: lavenderPalette.primaryDark,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    marginTop: spacing.sm,
  },
  modalButtonText: {
    ...typography.body,
    color: lavenderPalette.surface,
    fontWeight: '600',
  },
})

