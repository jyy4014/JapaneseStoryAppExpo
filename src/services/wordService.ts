import { supabase } from './supabase'
import type { Database } from './supabase'

type Word = Database['public']['Tables']['words']['Row']
type UserWordProgress = Database['public']['Tables']['user_word_progress']['Row']

export interface WordWithProgress extends Word {
  progress?: UserWordProgress
}

export interface SRSUpdateResult {
  level: number
  next_review: string
  correct_count: number
  wrong_count: number
}

export class WordService {
  // 단어 검색 (Edge Function을 통해 처리)
  static async searchWords(query: string, limit = 20): Promise<{ data: Word[] | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('search', {
        body: {
          query,
          type: 'words',
          limit
        }
      })

      if (error) throw error

      return { data: data?.words || [], error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 단어 상세 조회 (Edge Function을 통해 처리)
  static async getWord(id: number): Promise<{ data: Word | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('word-detail', {
        body: { wordId: id }
      })

      if (error) throw error

      return { data: data?.word || null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // lemma로 단어 조회
  static async getWordByLemma(lemma: string): Promise<{ data: Word | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('lemma', lemma)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 사용자 단어 진행도 조회 (Edge Function을 통해 처리)
  static async getWordsWithProgress(userId: string, limit = 50): Promise<{ data: WordWithProgress[] | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('word-learning', {
        body: {
          action: 'get-progress',
          userId,
          limit
        }
      })

      if (error) throw error

      return { data: data?.wordsWithProgress || [], error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 복습할 단어 조회 (Edge Function을 통해 처리)
  static async getWordsForReview(userId: string, limit = 20): Promise<{ data: WordWithProgress[] | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('word-learning', {
        body: {
          action: 'get-review-words',
          userId,
          limit
        }
      })

      if (error) throw error

      return { data: data?.wordsForReview || [], error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 단어 저장 (Edge Function을 통해 처리)
  static async saveWord(userId: string, wordId: number): Promise<{ data: UserWordProgress | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('word-learning', {
        body: {
          action: 'save-word',
          userId,
          wordId
        }
      })

      if (error) throw error

      return { data: data?.progress || null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // SRS 알고리즘으로 단어 진행도 업데이트 (Edge Function을 통해 처리)
  static async updateWordProgress(
    userId: string,
    wordId: number,
    isCorrect: boolean
  ): Promise<{ data: UserWordProgress | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('word-learning', {
        body: {
          action: 'review-word',
          userId,
          wordId,
          isCorrect
        }
      })

      if (error) throw error

      return { data: data?.progress || null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // SRS 레벨 계산 로직
  private static calculateSRSLevel(
    current: UserWordProgress,
    isCorrect: boolean
  ): SRSUpdateResult {
    const intervals = [1, 3, 7, 14, 30] // 레벨별 복습 간격 (일)

    let newLevel = current.level

    if (isCorrect) {
      // 정답: 레벨 상승 (최대 4)
      newLevel = Math.min(current.level + 1, 4)
    } else {
      // 오답: 레벨 하락 (최소 0)
      newLevel = Math.max(current.level - 1, 0)
    }

    // 다음 복습일 계산
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + intervals[newLevel])

    return {
      level: newLevel,
      next_review: nextReview.toISOString(),
      correct_count: current.correct_count + (isCorrect ? 1 : 0),
      wrong_count: current.wrong_count + (isCorrect ? 0 : 1)
    }
  }

  // 단어 삭제 (Edge Function을 통해 처리)
  static async removeWord(userId: string, wordId: number): Promise<{ error: any }> {
    try {
      const { error } = await supabase.functions.invoke('word-learning', {
        body: {
          action: 'remove-word',
          userId,
          wordId
        }
      })

      return { error }
    } catch (error) {
      return { error }
    }
  }

  // 사용자의 단어 학습 통계 (Edge Function을 통해 처리)
  static async getWordStats(userId: string): Promise<{
    data: {
      totalWords: number
      masteredWords: number
      learningWords: number
      newWords: number
      averageAccuracy: number
    } | null;
    error: any
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('word-learning', {
        body: {
          action: 'get-stats',
          userId
        }
      })

      if (error) throw error

      return { data: data?.stats || null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 오늘의 복습 단어 수 조회 (Edge Function을 통해 처리)
  static async getTodayReviewCount(userId: string): Promise<{ data: number; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('word-learning', {
        body: {
          action: 'get-today-review-count',
          userId
        }
      })

      if (error) throw error

      return { data: data?.count || 0, error: null }
    } catch (error) {
      return { data: 0, error }
    }
  }

  // 단어 발음 오디오 URL 생성
  static async getPronunciationUrl(pronunciationPath: string): Promise<{ data: { signedUrl: string } | null; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from('audio-private')
        .createSignedUrl(pronunciationPath, 3600) // 1시간 유효

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}
