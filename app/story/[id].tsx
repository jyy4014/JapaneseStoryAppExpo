import React, { useEffect, useState, useRef } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView 
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, spacing, typography } from '../../src/constants/theme'
import { AudioPlayer } from '../../src/components/player/AudioPlayer'
import { EpisodeService } from '../../src/services/episodeService'
import { usePlayerStore } from '../../src/stores/playerStore'
import type { Episode, Sentence } from '../../src/types/dto/episode'

export default function StoryPlayerScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const router = useRouter()
  
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  console.log('StoryPlayerScreen loaded with id:', id)
  
  const { currentTime } = usePlayerStore()
  const scrollViewRef = useRef<ScrollView>(null)

  // 에피소드 로드
  useEffect(() => {
    if (!id) return

    const loadEpisode = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await EpisodeService.getEpisode(id)

        if (fetchError || !data) {
          setError('에피소드를 불러오지 못했어요.')
          return
        }

        setEpisode(data)
      } catch (err) {
        console.error('Episode loading error:', err)
        setError('에피소드 로딩 중 오류가 발생했어요.')
      } finally {
        setLoading(false)
      }
    }

    loadEpisode()
  }, [id])

  // 현재 재생 중인 문장 찾기
  const getCurrentSentenceIndex = () => {
    if (!episode?.sentences) return -1

    const currentTimeMs = currentTime * 1000 // seconds to ms

    for (let i = 0; i < episode.sentences.length; i++) {
      const sentence = episode.sentences[i]
      const startMs = sentence.startMs ?? 0
      const endMs = sentence.endMs ?? Infinity
      
      if (currentTimeMs >= startMs && currentTimeMs < endMs) {
        return i
      }
    }
    return -1
  }

  const currentSentenceIndex = getCurrentSentenceIndex()

  // 현재 문장으로 스크롤
  useEffect(() => {
    if (currentSentenceIndex >= 0 && scrollViewRef.current) {
      // Auto-scroll to current sentence (optional)
      // scrollViewRef.current.scrollTo({ y: currentSentenceIndex * 100, animated: true })
    }
  }, [currentSentenceIndex])

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={lavenderPalette.primary} />
          <Text style={styles.loadingText}>에피소드를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !episode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error || '에피소드를 찾을 수 없어요.'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={lavenderPalette.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {episode.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            Lv.{episode.level} • {episode.category}
          </Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={lavenderPalette.text} />
        </TouchableOpacity>
      </View>

      {/* Sentences */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.sentencesContainer}
        contentContainerStyle={styles.sentencesContent}
      >
        {episode.sentences && episode.sentences.length > 0 ? (
          episode.sentences.map((sentence: Sentence, index: number) => {
            const isActive = index === currentSentenceIndex
            
            return (
              <View
                key={sentence.id}
                style={[
                  styles.sentenceCard,
                  isActive && styles.sentenceCardActive
                ]}
              >
                <Text style={[styles.sentenceJapanese, isActive && styles.sentenceActiveText]}>
                  {sentence.text}
                </Text>
              </View>
            )
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>문장 데이터가 없습니다.</Text>
          </View>
        )}
      </ScrollView>

      {/* Audio Player */}
      {id && <AudioPlayer episodeId={id} />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lavenderPalette.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: '#EF4444',
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    backgroundColor: lavenderPalette.primary,
  },
  backButtonText: {
    ...typography.button,
    color: lavenderPalette.surface,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE3FF',
    backgroundColor: lavenderPalette.surface,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: lavenderPalette.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: lavenderPalette.textSecondary,
    marginTop: 2,
  },

  // Sentences
  sentencesContainer: {
    flex: 1,
  },
  sentencesContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
  },
  sentenceCard: {
    padding: spacing.lg,
    borderRadius: spacing.md,
    backgroundColor: lavenderPalette.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.sm,
  },
  sentenceCardActive: {
    borderColor: lavenderPalette.primary,
    backgroundColor: lavenderPalette.primaryLight,
  },
  sentenceJapanese: {
    fontSize: 18,
    fontWeight: '600',
    color: lavenderPalette.text,
    lineHeight: 28,
  },
  sentenceKorean: {
    fontSize: 15,
    color: lavenderPalette.textSecondary,
    lineHeight: 24,
  },
  sentencePronunciation: {
    fontSize: 13,
    color: lavenderPalette.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  sentenceActiveText: {
    color: lavenderPalette.primaryDark,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
  },
})
