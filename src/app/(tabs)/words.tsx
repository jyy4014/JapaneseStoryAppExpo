import React, { useState, useEffect, useRef } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, spacing, typography } from '../../constants/theme'
import { useAuthStore } from '../../stores/authStore'
import { debugAuthConfig } from '../../config/debug'
import { FlashcardReview, type ReviewWord } from '../../components/wordbook/FlashcardReview'

export default function WordbookScreen() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewCount, setReviewCount] = useState(0)
  const [words, setWords] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalWords: 0,
    masteredWords: 0,
    totalCorrect: 0,
  })
  const [activeTab, setActiveTab] = useState<'all' | 'by-level'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('') // 검색 입력값 (debounce 전)
  const [wordsByLevel, setWordsByLevel] = useState<{ [level: number]: any[] }>({})
  const [reviewWords, setReviewWords] = useState<ReviewWord[]>([])
  const [reviewVisible, setReviewVisible] = useState(false)
  const [loadingReview, setLoadingReview] = useState(false)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // 개발 환경에서만 모크 사용자 사용
  useEffect(() => {
    if (!user && debugAuthConfig.useMockAuth) {
      setUser({ id: debugAuthConfig.mockUser.id })
    }
  }, [user, setUser])

  // 검색 입력 debounce (300ms)
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300)

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [searchInput])

  useEffect(() => {
    if (user?.id) {
      loadWordbookData()
    } else {
      setError('로그인이 필요합니다.')
      setLoading(false)
    }
  }, [user, activeTab, searchQuery])

  const loadWordbookData = async () => {
    if (!user?.id) {
      setError('사용자 정보가 없습니다.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const baseUrl = 'https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api'
      const headers = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
      }

      // 복습 개수 조회
      const reviewCountRes = await fetch(
        `${baseUrl}/wordbook/review-count?userId=${user.id}`,
        { headers }
      )
      if (!reviewCountRes.ok) {
        throw new Error(`복습 개수 조회 실패: ${reviewCountRes.status}`)
      }
      const reviewCountData = await reviewCountRes.json()
      setReviewCount(reviewCountData.count || 0)

      // 단어장 목록 조회
      const wordsRes = await fetch(
        `${baseUrl}/wordbook?userId=${user.id}&tab=${activeTab}&search=${encodeURIComponent(searchQuery)}`,
        { headers }
      )
      if (!wordsRes.ok) {
        throw new Error(`단어장 목록 조회 실패: ${wordsRes.status}`)
      }
      const wordsData = await wordsRes.json()
      const wordsList = wordsData.words || []
      setWords(wordsList)

      // 레벨별 그룹화
      const groupedByLevel: { [level: number]: any[] } = {}
      wordsList.forEach((word: any) => {
        const level = word.level || 0
        if (!groupedByLevel[level]) {
          groupedByLevel[level] = []
        }
        groupedByLevel[level].push(word)
      })
      setWordsByLevel(groupedByLevel)

      // 통계 조회
      const statsRes = await fetch(
        `${baseUrl}/wordbook/stats?userId=${user.id}`,
        { headers }
      )
      if (!statsRes.ok) {
        const errorText = await statsRes.text()
        if (__DEV__) {
          console.error('통계 조회 실패:', statsRes.status, errorText)
        }
        // 통계 조회 실패 시 단어 목록 개수로 대체
        const masteredCount = wordsList.filter((w: any) => (w.level || 0) >= 4).length
        const totalCorrect = wordsList.reduce((sum: number, w: any) => sum + (w.correctCount || 0), 0)
        setStats({
          totalWords: wordsList.length,
          masteredWords: masteredCount,
          totalCorrect,
        })
      } else {
        const statsData = await statsRes.json()
        if (__DEV__) {
          console.log('통계 데이터:', statsData)
        }
        setStats({
          totalWords: statsData.totalWords ?? wordsList.length,
          masteredWords: statsData.masteredWords ?? 0,
          totalCorrect: statsData.totalCorrect ?? 0,
        })
      }
    } catch (err) {
      if (__DEV__) {
        console.error('Failed to load wordbook data:', err)
      }
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartReview = async () => {
    if (!user?.id) return

    try {
      setLoadingReview(true)

      const baseUrl = 'https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api'
      const headers = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
      }

      // 복습할 단어 목록 조회
      const reviewRes = await fetch(`${baseUrl}/wordbook/review?userId=${user.id}&limit=20`, {
        headers,
      })

      if (!reviewRes.ok) {
        throw new Error(`복습 단어 조회 실패: ${reviewRes.status}`)
      }

      const reviewData = await reviewRes.json()
      const words = reviewData.words || []

      if (words.length === 0) {
        // 복습할 단어가 없음
        if (__DEV__) {
          console.log('복습할 단어가 없습니다')
        }
        return
      }

      setReviewWords(words)
      setReviewVisible(true)
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to load review words:', error)
      }
    } finally {
      setLoadingReview(false)
    }
  }

  const handleReviewComplete = (results: { correct: number; wrong: number }) => {
    if (__DEV__) {
      console.log('Review completed:', results)
    }
    // 복습 완료 후 데이터 새로고침
    if (user?.id) {
      loadWordbookData()
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={lavenderPalette.primary} />
          <Text style={styles.loadingText}>단어장을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={lavenderPalette.error ?? '#E53E3E'} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadWordbookData}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 복습 카드 */}
        <TouchableOpacity
          style={[
            styles.reviewCard,
            (reviewCount === 0 || loadingReview) && styles.reviewCardDisabled,
          ]}
          onPress={handleStartReview}
          disabled={reviewCount === 0 || loadingReview}
        >
          {loadingReview ? (
            <ActivityIndicator size="large" color={lavenderPalette.surface} />
          ) : (
            <>
              <Ionicons
                name="book"
                size={32}
                color={reviewCount === 0 ? lavenderPalette.textSecondary : lavenderPalette.surface}
              />
              <Text style={styles.reviewCardTitle}>오늘 복습할 단어</Text>
              <Text style={styles.reviewCardCount}>
                {reviewCount === 0 ? '모든 단어를 복습했어요! 🎉' : `${reviewCount}개`}
              </Text>
              {reviewCount > 0 && (
                <Text style={styles.reviewCardButton}>복습 시작하기</Text>
              )}
            </>
          )}
        </TouchableOpacity>

        {/* 단어장 탭 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              전체 단어
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'by-level' && styles.tabActive]}
            onPress={() => setActiveTab('by-level')}
          >
            <Text style={[styles.tabText, activeTab === 'by-level' && styles.tabTextActive]}>
              레벨별
            </Text>
          </TouchableOpacity>
        </View>

        {/* 검색 바 (전체 단어 탭일 때만) */}
        {activeTab === 'all' && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={lavenderPalette.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="단어 검색..."
              placeholderTextColor={lavenderPalette.textSecondary}
              value={searchInput}
              onChangeText={setSearchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchInput.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchInput('')
                  setSearchQuery('')
                }}
                style={styles.searchClearButton}
              >
                <Ionicons name="close-circle" size={20} color={lavenderPalette.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 단어 목록 */}
        <View style={styles.wordListContainer}>
          {activeTab === 'all' ? (
            // 전체 단어 탭
            words.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="book-outline" size={48} color={lavenderPalette.textSecondary} />
                <Text style={styles.emptyText}>저장한 단어가 없습니다.</Text>
                <Text style={styles.emptySubtext}>
                  플레이어에서 단어를 클릭하여 저장해보세요!
                </Text>
              </View>
            ) : (
              words.map((word) => (
                <TouchableOpacity key={word.id} style={styles.wordCard}>
                  <View style={styles.wordCardHeader}>
                    <Text style={styles.wordKanji}>{word.kanji || word.meaningKo}</Text>
                    <View style={styles.wordMeta}>
                      <Text style={styles.wordLevel}>Level {word.level || 0}</Text>
                      {word.jlptLevel && (
                        <Text style={styles.wordJlpt}>{word.jlptLevel}</Text>
                      )}
                    </View>
                  </View>
                  {word.kana && <Text style={styles.wordKana}>{word.kana}</Text>}
                  {word.romaji && <Text style={styles.wordRomaji}>{word.romaji}</Text>}
                  <Text style={styles.wordMeaning}>{word.meaningKo}</Text>
                </TouchableOpacity>
              ))
            )
          ) : (
            // 레벨별 탭
            Object.keys(wordsByLevel).length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="book-outline" size={48} color={lavenderPalette.textSecondary} />
                <Text style={styles.emptyText}>저장한 단어가 없습니다.</Text>
                <Text style={styles.emptySubtext}>
                  플레이어에서 단어를 클릭하여 저장해보세요!
                </Text>
              </View>
            ) : (
              Object.keys(wordsByLevel)
                .sort((a, b) => Number(a) - Number(b))
                .map((levelStr) => {
                  const level = Number(levelStr)
                  const levelWords = wordsByLevel[level]
                  return (
                    <View key={level} style={styles.levelGroup}>
                      <View style={styles.levelHeader}>
                        <Text style={styles.levelTitle}>Level {level}</Text>
                        <Text style={styles.levelCount}>{levelWords.length}개</Text>
                      </View>
                      {levelWords.map((word) => (
                        <TouchableOpacity key={word.id} style={styles.wordCard}>
                          <View style={styles.wordCardHeader}>
                            <Text style={styles.wordKanji}>{word.kanji || word.meaningKo}</Text>
                            <View style={styles.wordMeta}>
                              {word.jlptLevel && (
                                <Text style={styles.wordJlpt}>{word.jlptLevel}</Text>
                              )}
                            </View>
                          </View>
                          {word.kana && <Text style={styles.wordKana}>{word.kana}</Text>}
                          {word.romaji && <Text style={styles.wordRomaji}>{word.romaji}</Text>}
                          <Text style={styles.wordMeaning}>{word.meaningKo}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )
                })
            )
          )}
        </View>

        {/* 학습 통계 */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalWords}</Text>
            <Text style={styles.statLabel}>총 저장</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.masteredWords}</Text>
            <Text style={styles.statLabel}>완전 학습</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalCorrect}</Text>
            <Text style={styles.statLabel}>누적 정답</Text>
          </View>
        </View>
      </ScrollView>

      {/* 플래시카드 복습 모달 */}
      <FlashcardReview
        visible={reviewVisible}
        words={reviewWords}
        onClose={() => {
          setReviewVisible(false)
          setReviewWords([])
        }}
        onComplete={handleReviewComplete}
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
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: lavenderPalette.text,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: lavenderPalette.primaryDark,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    marginTop: spacing.md,
  },
  retryButtonText: {
    ...typography.body,
    color: lavenderPalette.surface,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  reviewCard: {
    backgroundColor: lavenderPalette.primaryDark,
    borderRadius: spacing.lg,
    padding: spacing.xl,
    margin: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewCardDisabled: {
    backgroundColor: '#E5E5E5',
  },
  reviewCardTitle: {
    ...typography.body,
    color: lavenderPalette.surface,
    fontSize: 16,
  },
  reviewCardCount: {
    ...typography.h1,
    color: lavenderPalette.surface,
    fontSize: 36,
    fontWeight: '700',
  },
  reviewCardButton: {
    ...typography.body,
    color: lavenderPalette.surface,
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    backgroundColor: lavenderPalette.surface,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: lavenderPalette.primaryLight,
  },
  tabText: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: lavenderPalette.primaryDark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lavenderPalette.surface,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: lavenderPalette.text,
    fontSize: 16,
    padding: 0,
  },
  searchClearButton: {
    padding: spacing.xs,
  },
  wordListContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  levelGroup: {
    marginBottom: spacing.xl,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  levelTitle: {
    ...typography.h4,
    fontSize: 18,
    color: lavenderPalette.primaryDark,
    fontWeight: '700',
  },
  levelCount: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.h4,
    color: lavenderPalette.text,
  },
  emptySubtext: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    textAlign: 'center',
  },
  wordCard: {
    backgroundColor: lavenderPalette.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  wordCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  wordKanji: {
    ...typography.h3,
    fontSize: 24,
    color: lavenderPalette.text,
  },
  wordMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  wordLevel: {
    ...typography.body,
    fontSize: 12,
    color: lavenderPalette.primary,
    backgroundColor: lavenderPalette.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
  },
  wordJlpt: {
    ...typography.body,
    fontSize: 12,
    color: lavenderPalette.textSecondary,
  },
  wordKana: {
    ...typography.body,
    fontSize: 18,
    color: lavenderPalette.textSecondary,
  },
  wordRomaji: {
    ...typography.body,
    fontSize: 14,
    color: lavenderPalette.textSecondary,
    fontStyle: 'italic',
  },
  wordMeaning: {
    ...typography.body,
    fontSize: 16,
    color: lavenderPalette.text,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: lavenderPalette.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    ...typography.h2,
    fontSize: 24,
    color: lavenderPalette.primaryDark,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.body,
    fontSize: 12,
    color: lavenderPalette.textSecondary,
  },
})

