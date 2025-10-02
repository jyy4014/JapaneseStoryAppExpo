import { useCallback, useState } from 'react';
import { ApiService } from '../services/api';

export interface EpisodeDetail {
  id: string;
  title: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  script?: string;
  summary?: string;
  duration_seconds?: number;
  episode_sentences?: {
    id: string;
    order: number;
    sentence_jp: string;
    sentence_ko?: string;
    target_word_ids?: string[];
  }[];
  episode_target_words?: {
    word_id: string;
    words: {
      id: string;
      kanji?: string;
      kana?: string;
      meaning_ko: string;
    };
  }[];
}

export function transformEpisodeDetail(data: EpisodeDetail) {
  return {
    id: data.id,
    title: data.title,
    level: data.level,
    summary: data.summary,
    durationSeconds: data.duration_seconds,
    sentences: data.episode_sentences
      ?.sort((a, b) => a.order - b.order)
      .map((sentence) => ({
        id: sentence.id,
        order: sentence.order,
        jpText: sentence.sentence_jp,
        koText: sentence.sentence_ko,
        targetWordIds: sentence.target_word_ids ?? [],
      })) ?? [],
    targetWords:
      data.episode_target_words?.map((tw) => ({
        id: tw.word_id,
        kanji: tw.words.kanji,
        kana: tw.words.kana,
        meaningKo: tw.words.meaning_ko,
      })) ?? [],
  };
}

export default function useStoryDetail(storyId: string | undefined) {
  const [detail, setDetail] = useState<ReturnType<typeof transformEpisodeDetail> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const fetchDetail = useCallback(async () => {
    if (!storyId) {
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const response = await ApiService.getStoryById(storyId);
      setDetail(transformEpisodeDetail(response));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : '사연 상세를 불러오는 데 실패했습니다.');
      setDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [storyId]);

  return {
    detail,
    isLoading,
    error,
    fetchDetail,
  };
}

