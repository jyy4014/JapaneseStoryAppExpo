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
import { lavenderPalette, spacing, typography } from '../../constants/theme'
import { AudioPlayer } from '../../components/player/AudioPlayer'
import { EpisodeService } from '../../services/episodeService'
import { usePlayerStore } from '../../stores/playerStore'
import { WordBottomSheet } from '../../components/words/WordBottomSheet'
import { parseScript, renderParsedScript } from '../../utils/parseScript'
import type { Episode, Sentence } from '../../types/dto/episode'

export default function StoryPlayerScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const router = useRouter()
  
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 단어 Bottom Sheet 상태
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
  const [wordSheetVisible, setWordSheetVisible] = useState(false)
  
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
            
            // Script 파싱
            const parsedSegments = sentence.text ? parseScript(sentence.text) : []
            
            return (
              <View
                key={sentence.id}
                style={[
                  styles.sentenceCard,
                  isActive && styles.sentenceCardActive
                ]}
              >
                <Text style={[styles.sentenceJapanese, isActive && styles.sentenceActiveText]}>
                  {renderParsedScript(
                    parsedSegments,
                    (wordId, wordText) => {
                      console.log('Word clicked:', wordId, wordText)
                      setSelectedWordId(wordId)
                      setWordSheetVisible(true)
                    },
                    styles.sentenceJapanese,
                    styles.wordHighlight
                  )}
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
      
      {/* Word Bottom Sheet */}
      <WordBottomSheet
        visible={wordSheetVisible}
        wordId={selectedWordId}
        onClose={() => {
          setWordSheetVisible(false)
          setSelectedWordId(null)
        }}
        onSave={async (wordId) => {
          // TODO: userId 가져오기 (authStore에서)
          console.log('Saving word:', wordId)
          
          const response = await fetch(
            `https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api/words/${wordId}/save`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
              },
              body: JSON.stringify({ userId: 'test-user-id' }) // TODO: 실제 userId 사용
            }
          )
          
          if (!response.ok) {
            throw new Error('Failed to save word')
          }
        }}
      />
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
  wordHighlight: {
    color: lavenderPalette.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationColor: lavenderPalette.primary,
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
