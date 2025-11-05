import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, spacing, typography } from '../../constants/theme'
import { useAuthStore } from '../../stores/authStore'

export interface ReviewWord {
  id: string
  progressId: string
  level: number
  nextReview: string
  correctCount: number
  wrongCount: number
  kanji: string | null
  kana: string | null
  romaji: string | null
  meaningKo: string
  jlptLevel: string | null
}

interface FlashcardReviewProps {
  visible: boolean
  words: ReviewWord[]
  onClose: () => void
  onComplete: (results: { correct: number; wrong: number }) => void
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

export function FlashcardReview({ visible, words, onClose, onComplete }: FlashcardReviewProps) {
  const { user } = useAuthStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({ correct: 0, wrong: 0 })
  const [completed, setCompleted] = useState(false)

  const flipAnim = React.useRef(new Animated.Value(0)).current
  const currentWord = currentIndex < words.length ? words[currentIndex] : null

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0)
      setShowAnswer(false)
      setResults({ correct: 0, wrong: 0 })
      setCompleted(false)
      flipAnim.setValue(0)
    }
  }, [visible, words])

  const handleShowAnswer = () => {
    Animated.spring(flipAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start()
    setShowAnswer(true)
  }

  const handleFeedback = async (feedback: 'hard' | 'good' | 'easy') => {
    if (!currentWord || loading) return

    try {
      setLoading(true)

      const baseUrl = 'https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api'
      const headers = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
      }

      if (!user?.id) {
        throw new Error('사용자 정보가 없습니다.')
      }

      const response = await fetch(`${baseUrl}/wordbook/review`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: user.id,
          progressId: currentWord.progressId,
          feedback,
        }),
      })

      if (!response.ok) {
        throw new Error('피드백 업데이트 실패')
      }

      // 결과 업데이트
      const newResults = feedback === 'hard'
        ? { ...results, wrong: results.wrong + 1 }
        : { ...results, correct: results.correct + 1 }
      setResults(newResults)

      // 다음 단어로 이동
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowAnswer(false)
        flipAnim.setValue(0)
      } else {
        // 복습 완료
        setCompleted(true)
        onComplete(newResults)
      }
    } catch (error) {
      console.error('Failed to update feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  })

  if (!visible || words.length === 0) return null

  if (completed) {
    // 복습 완료 화면
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.completeContainer}>
            <Ionicons name="checkmark-circle" size={64} color={lavenderPalette.primary} />
            <Text style={styles.completeTitle}>🎉 복습 완료!</Text>
            <Text style={styles.completeSubtitle}>오늘 맞춘 단어: {results.correct}개</Text>
            <Text style={styles.completeSubtitle}>틀린 단어: {results.wrong}개</Text>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => {
                onClose()
                setCompleted(false)
              }}
            >
              <Text style={styles.completeButtonText}>단어장으로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  if (!currentWord) return null

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              onClose()
              setCompleted(false)
            }}
          >
            <Ionicons name="arrow-back" size={24} color={lavenderPalette.text} />
          </TouchableOpacity>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {words.length}
          </Text>
          <View style={styles.backButton} />
        </View>

        {/* 카드 영역 */}
        <View style={styles.cardContainer}>
          {/* 앞면 */}
          {!showAnswer && (
            <TouchableOpacity
              style={styles.cardFront}
              activeOpacity={0.9}
              onPress={handleShowAnswer}
            >
              <View style={styles.cardContent}>
                <Text style={styles.wordKanji}>{currentWord.kanji || currentWord.meaningKo}</Text>
                {currentWord.kana && <Text style={styles.wordKana}>{currentWord.kana}</Text>}
                {currentWord.romaji && <Text style={styles.wordRomaji}>{currentWord.romaji}</Text>}
                <TouchableOpacity style={styles.showAnswerButton} onPress={handleShowAnswer}>
                  <Text style={styles.showAnswerButtonText}>정답 확인</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}

          {/* 뒷면 */}
          {showAnswer && (
            <View style={styles.cardBack}>
              <View style={styles.cardContent}>
                <Text style={styles.wordKanji}>{currentWord.kanji || currentWord.meaningKo}</Text>
                {currentWord.kana && <Text style={styles.wordKana}>{currentWord.kana}</Text>}
                {currentWord.romaji && <Text style={styles.wordRomaji}>{currentWord.romaji}</Text>}
                
                <View style={styles.meaningSection}>
                  <Text style={styles.meaningText}>{currentWord.meaningKo}</Text>
                  {currentWord.jlptLevel && (
                    <Text style={styles.jlptLevel}>{currentWord.jlptLevel}</Text>
                  )}
                </View>

                {/* 피드백 버튼 */}
                <View style={styles.feedbackButtons}>
                  <TouchableOpacity
                    style={[styles.feedbackButton, styles.feedbackButtonHard]}
                    onPress={() => handleFeedback('hard')}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.feedbackButtonText}>어려워요</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.feedbackButton, styles.feedbackButtonGood]}
                    onPress={() => handleFeedback('good')}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.feedbackButtonText}>알겠어요</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.feedbackButton, styles.feedbackButtonEasy]}
                    onPress={() => handleFeedback('easy')}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="star" size={20} color="#FFFFFF" />
                        <Text style={styles.feedbackButtonText}>아주 쉬워요</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lavenderPalette.background,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    ...typography.h4,
    color: lavenderPalette.text,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  cardFront: {
    width: SCREEN_WIDTH * 0.9,
    minHeight: SCREEN_HEIGHT * 0.5,
    backgroundColor: lavenderPalette.surface,
    borderRadius: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  cardBack: {
    width: SCREEN_WIDTH * 0.9,
    minHeight: SCREEN_HEIGHT * 0.5,
    backgroundColor: lavenderPalette.surface,
    borderRadius: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl * 2,
    gap: spacing.lg,
  },
  wordKanji: {
    ...typography.h1,
    fontSize: 48,
    color: lavenderPalette.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  wordKana: {
    ...typography.h3,
    fontSize: 28,
    color: lavenderPalette.textSecondary,
    textAlign: 'center',
  },
  wordRomaji: {
    ...typography.body,
    fontSize: 18,
    color: lavenderPalette.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  showAnswerButton: {
    backgroundColor: lavenderPalette.primaryDark,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    marginTop: spacing.lg,
  },
  showAnswerButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: lavenderPalette.surface,
  },
  meaningSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#EBE3FF',
    width: '100%',
  },
  meaningText: {
    ...typography.h3,
    fontSize: 24,
    color: lavenderPalette.text,
    textAlign: 'center',
  },
  jlptLevel: {
    ...typography.body,
    fontSize: 16,
    color: lavenderPalette.textSecondary,
    backgroundColor: lavenderPalette.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    width: '100%',
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.md,
  },
  feedbackButtonHard: {
    backgroundColor: '#FF6B6B',
  },
  feedbackButtonGood: {
    backgroundColor: '#4D96FF',
  },
  feedbackButtonEasy: {
    backgroundColor: '#6BCB77',
  },
  feedbackButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeContainer: {
    backgroundColor: lavenderPalette.surface,
    borderRadius: spacing.xl,
    padding: spacing.xl * 2,
    alignItems: 'center',
    gap: spacing.lg,
    minWidth: 300,
    maxWidth: 400,
  },
  completeTitle: {
    ...typography.h2,
    fontSize: 32,
    color: lavenderPalette.text,
    fontWeight: '700',
  },
  completeSubtitle: {
    ...typography.body,
    fontSize: 18,
    color: lavenderPalette.textSecondary,
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: lavenderPalette.primaryDark,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    marginTop: spacing.md,
    width: '100%',
  },
  completeButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: lavenderPalette.surface,
    textAlign: 'center',
  },
})

