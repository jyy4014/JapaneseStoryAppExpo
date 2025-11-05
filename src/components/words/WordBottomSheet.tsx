import React, { useEffect, useState } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, spacing, typography } from '../../constants/theme'

export interface Word {
  id: string
  kanji: string | null
  kana: string | null
  romaji: string | null
  meaning_ko: string
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
}

interface WordBottomSheetProps {
  visible: boolean
  wordId: string | null
  onClose: () => void
  onSave?: (wordId: string) => void
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.6

export function WordBottomSheet({ visible, wordId, onClose, onSave }: WordBottomSheetProps) {
  const [word, setWord] = useState<Word | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const slideAnim = React.useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current

  useEffect(() => {
    if (visible) {
      // 슬라이드 업 애니메이션
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start()

      // 단어 데이터 로드
      if (wordId) {
        loadWord(wordId)
      }
    } else {
      // 슬라이드 다운 애니메이션
      Animated.timing(slideAnim, {
        toValue: BOTTOM_SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start()
      
      // 애니메이션 후 상태 초기화
      setTimeout(() => {
        setWord(null)
        setSaved(false)
      }, 300)
    }
  }, [visible, wordId])

  const loadWord = async (id: string) => {
    try {
      setLoading(true)
      // TODO: WordService로 교체
      const response = await fetch(
        `https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api/words/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
          },
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setWord(data.word)
      } else {
        console.error('Failed to load word:', response.status)
      }
    } catch (error) {
      console.error('Error loading word:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!word || !onSave) return

    try {
      setSaving(true)
      await onSave(word.id)
      setSaved(true)
      
      // 1초 후 자동으로 닫기
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      console.error('Error saving word:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Handle Bar */}
              <View style={styles.handleBar} />

              {/* Content */}
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={lavenderPalette.primary} />
                    <Text style={styles.loadingText}>단어를 불러오는 중...</Text>
                  </View>
                ) : word ? (
                  <>
                    {/* Word Display */}
                    <View style={styles.wordSection}>
                      <View style={styles.wordHeader}>
                        {word.kanji && (
                          <Text style={styles.wordKanji}>{word.kanji}</Text>
                        )}
                        <View style={styles.levelBadge}>
                          <Text style={styles.levelText}>{word.jlpt_level}</Text>
                        </View>
                      </View>
                      
                      {word.kana && (
                        <Text style={styles.wordKana}>{word.kana}</Text>
                      )}
                      
                      {word.romaji && (
                        <Text style={styles.wordRomaji}>{word.romaji}</Text>
                      )}
                    </View>

                    {/* Meaning */}
                    <View style={styles.meaningSection}>
                      <Text style={styles.sectionTitle}>의미</Text>
                      <Text style={styles.meaningText}>{word.meaning_ko}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      {saved ? (
                        <View style={styles.savedButton}>
                          <Ionicons name="checkmark-circle" size={20} color={lavenderPalette.surface} />
                          <Text style={styles.savedButtonText}>저장 완료!</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.saveButton}
                          onPress={handleSave}
                          disabled={saving}
                        >
                          {saving ? (
                            <ActivityIndicator size="small" color={lavenderPalette.surface} />
                          ) : (
                            <>
                              <Ionicons name="bookmark" size={20} color={lavenderPalette.surface} />
                              <Text style={styles.saveButtonText}>단어장에 저장</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>닫기</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={lavenderPalette.error ?? '#E53E3E'} />
                    <Text style={styles.errorText}>단어를 불러올 수 없습니다.</Text>
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: lavenderPalette.surface,
    borderTopLeftRadius: spacing.lg,
    borderTopRightRadius: spacing.lg,
    height: BOTTOM_SHEET_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: lavenderPalette.textSecondary,
    opacity: 0.3,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  errorText: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    marginTop: spacing.md,
  },
  wordSection: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE3FF',
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  wordKanji: {
    fontSize: 36,
    fontWeight: '700',
    color: lavenderPalette.text,
  },
  levelBadge: {
    backgroundColor: lavenderPalette.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: lavenderPalette.surface,
  },
  wordKana: {
    fontSize: 20,
    color: lavenderPalette.textSecondary,
    marginBottom: spacing.xs,
  },
  wordRomaji: {
    fontSize: 16,
    color: lavenderPalette.textSecondary,
    fontStyle: 'italic',
  },
  meaningSection: {
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: lavenderPalette.text,
    marginBottom: spacing.sm,
  },
  meaningText: {
    ...typography.body,
    fontSize: 18,
    color: lavenderPalette.text,
    lineHeight: 28,
  },
  actionButtons: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: lavenderPalette.primaryDark,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: lavenderPalette.surface,
  },
  savedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#10B981',
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
  },
  savedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: lavenderPalette.surface,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  closeButtonText: {
    fontSize: 16,
    color: lavenderPalette.textSecondary,
  },
})

