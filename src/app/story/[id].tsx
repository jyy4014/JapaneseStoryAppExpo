import React, { useEffect, useState, useRef } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  Dimensions
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

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
  const sentenceRefs = useRef<{ [key: number]: View | null }>({})
  const [sentenceLayouts, setSentenceLayouts] = useState<{ [key: number]: { y: number; height: number } }>({})

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

  // 현재 문장으로 스크롤 (중앙 정렬)
  useEffect(() => {
    if (currentSentenceIndex >= 0 && scrollViewRef.current && sentenceLayouts[currentSentenceIndex]) {
      const layout = sentenceLayouts[currentSentenceIndex]
      const scrollY = layout.y - (SCREEN_HEIGHT / 2) + (layout.height / 2)
      
      scrollViewRef.current.scrollTo({
        y: Math.max(0, scrollY),
        animated: true,
      })
    }
  }, [currentSentenceIndex, sentenceLayouts])

  // 문장 레이아웃 측정
  const handleSentenceLayout = (index: number, event: any) => {
    const { y, height } = event.nativeEvent.layout
    setSentenceLayouts((prev) => ({
      ...prev,
      [index]: { y, height },
    }))
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header Skeleton */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={lavenderPalette.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.headerTitleSkeleton} />
            <View style={styles.headerSubtitleSkeleton} />
          </View>
          <View style={styles.headerButton} />
        </View>

        {/* Sentences Skeleton */}
        <ScrollView style={styles.sentencesContainer} contentContainerStyle={styles.sentencesContent}>
          <SentenceSkeleton count={8} />
        </ScrollView>

        {/* Audio Player Skeleton */}
        <View style={styles.playerSkeleton}>
          <View style={styles.playerSkeletonBar} />
          <View style={styles.playerSkeletonControls}>
            <View style={styles.playerSkeletonButton} />
            <View style={styles.playerSkeletonPlayButton} />
            <View style={styles.playerSkeletonButton} />
          </View>
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
        <View style={styles.headerRight}>
          {/* 재생 속도 아이콘 */}
          <TouchableOpacity style={styles.headerIconButton} onPress={() => {
            // TODO: 재생 속도 선택 모달 표시
            console.log('Playback speed')
          }}>
            <Text style={styles.headerIconText}>{playbackRate}x</Text>
          </TouchableOpacity>
          
          {/* A-B 반복 아이콘 */}
          {isAbRepeatActive && (
            <TouchableOpacity style={styles.headerIconButton}>
              <Ionicons name="repeat" size={20} color={lavenderPalette.primary} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={lavenderPalette.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sentences - 몰입형 문장 보기 */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.sentencesContainer}
        contentContainerStyle={styles.sentencesContent}
        showsVerticalScrollIndicator={false}
      >
        {episode.sentences && episode.sentences.length > 0 ? (
          episode.sentences.map((sentence: Sentence, index: number) => {
            const isActive = index === currentSentenceIndex
            const isPrev = index === currentSentenceIndex - 1
            const isNext = index === currentSentenceIndex + 1
            const isContext = isPrev || isNext
            
            // Script 파싱
            const parsedSegments = sentence.text ? parseScript(sentence.text) : []
            
            return (
              <View
                key={sentence.id}
                ref={(ref) => {
                  sentenceRefs.current[index] = ref
                }}
                onLayout={(event) => handleSentenceLayout(index, event)}
                style={[
                  styles.sentenceCard,
                  isActive && styles.sentenceCardActive,
                  isContext && styles.sentenceCardContext,
                ]}
              >
                <Text
                  style={[
                    styles.sentenceJapanese,
                    isActive && styles.sentenceJapaneseActive,
                    isContext && styles.sentenceJapaneseContext,
                  ]}
                >
                  {renderParsedScript(
                    parsedSegments,
                    (wordId, wordText) => {
                      console.log('Word clicked:', wordId, wordText)
                      setSelectedWordId(wordId)
                      setWordSheetVisible(true)
                    },
                    isActive ? styles.sentenceJapaneseActive : styles.sentenceJapanese,
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
          const userId = 'e5d4b7b3-de14-4b9a-b6c8-03dfe90fba97' // 테스트용 (나중에 authStore.user.id로 교체)
          console.log('Saving word:', wordId, 'for user:', userId)
          
          const response = await fetch(
            `https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api/words/${encodeURIComponent(wordId)}/save`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
              },
              body: JSON.stringify({ userId })
            }
          )
          
          if (!response.ok) {
            const errorData = await response.json()
            console.error('Failed to save word:', errorData)
            throw new Error(errorData.message || 'Failed to save word')
          }
          
          console.log('Word saved successfully!')
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerIconButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    backgroundColor: lavenderPalette.primaryLight,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: lavenderPalette.primaryDark,
  },

  // Sentences - 몰입형 문장 보기
  sentencesContainer: {
    flex: 1,
  },
  sentencesContent: {
    paddingVertical: SCREEN_HEIGHT * 0.3, // 상단 여백 (중앙 정렬을 위해)
    paddingHorizontal: spacing.lg,
    paddingBottom: SCREEN_HEIGHT * 0.3 + spacing.xl * 2, // 하단 여백
  },
  sentenceCard: {
    minHeight: 150,
    padding: spacing.xl,
    borderRadius: spacing.lg,
    backgroundColor: lavenderPalette.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    marginVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sentenceCardActive: {
    borderColor: lavenderPalette.primary,
    backgroundColor: lavenderPalette.primaryLight,
    borderWidth: 3,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 200,
  },
  sentenceCardContext: {
    opacity: 0.4,
    transform: [{ scale: 0.85 }],
  },
  sentenceJapanese: {
    fontSize: 20,
    fontWeight: '600',
    color: lavenderPalette.text,
    lineHeight: 32,
    textAlign: 'center',
  },
  sentenceJapaneseActive: {
    fontSize: 32,
    fontWeight: '700',
    color: lavenderPalette.primaryDark,
    lineHeight: 48,
  },
  sentenceJapaneseContext: {
    fontSize: 16,
    opacity: 0.6,
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
