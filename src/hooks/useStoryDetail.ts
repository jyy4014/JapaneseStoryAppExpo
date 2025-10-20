import { useCallback, useState } from 'react';
import { ApiService } from '../services/api';
import type { StoryLevel } from '../store/useStoryStore';

interface EpisodeSentenceRow {
  id: string;
  seq_no: number;
  text: string;
  start_ms?: number | null;
  end_ms?: number | null;
  translation_ko?: string | null;
}

interface EpisodeTargetWordRow {
  required_occurrences?: number | null;
  words: {
    id: string;
    kanji?: string | null;
    kana?: string | null;
    meaning_ko?: string | null;
    romaji?: string | null;
    jlpt_level?: string | null;
  } | null;
}

interface EpisodeAudioAssetRow {
  id: string;
  asset_type?: string | null;
  storage_path?: string | null;
  duration_ms?: number | null;
  is_tts?: boolean | null;
}

export interface EpisodeDetailResponse {
  id: string;
  title: string;
  level: StoryLevel;
  summary?: string | null;
  duration_seconds?: number | null;
  script?: string | null;
  episode_sentences?: EpisodeSentenceRow[] | null;
  episode_target_words?: EpisodeTargetWordRow[] | null;
  audio_assets?: EpisodeAudioAssetRow[] | null;
}

export interface EpisodeDetailViewModel {
  id: string;
  title: string;
  level: StoryLevel;
  summary?: string;
  durationSeconds?: number;
  script?: string;
  scriptPlain?: string;
  sentences: {
    id: string;
    order: number;
    jpText: string;
    koText?: string;
    startMs?: number;
    endMs?: number;
  }[];
  targetWords: {
    id: string;
    kanji?: string;
    kana?: string;
    romaji?: string;
    meaningKo?: string;
    jlptLevel?: string;
    requiredOccurrences?: number;
  }[];
  audioAssets: {
    id: string;
    assetType?: string;
    storagePath?: string;
    durationMs?: number;
    isTts?: boolean;
  }[];
}

function sanitizeScript(script?: string | null) {
  if (!script) {
    return undefined;
  }

  return script.replace(/<w[^>]*>(.*?)<\/w>/g, '$1');
}

export function transformEpisodeDetail(data: EpisodeDetailResponse): EpisodeDetailViewModel {
  const sentences = (data.episode_sentences ?? [])
    .slice()
    .sort((a, b) => a.seq_no - b.seq_no)
    .map((sentence) => ({
      id: sentence.id,
      order: sentence.seq_no,
      jpText: sentence.text,
      koText: sentence.translation_ko ?? undefined,
      startMs: sentence.start_ms ?? undefined,
      endMs: sentence.end_ms ?? undefined,
    }));

  const targetWords = (data.episode_target_words ?? [])
    .map((entry) => entry.words)
    .filter((word): word is NonNullable<typeof word> => Boolean(word?.id))
    .map((word, index) => ({
      id: word.id,
      kanji: word.kanji ?? undefined,
      kana: word.kana ?? undefined,
      romaji: word.romaji ?? undefined,
      meaningKo: word.meaning_ko ?? undefined,
      jlptLevel: word.jlpt_level ?? undefined,
      requiredOccurrences: (data.episode_target_words?.[index]?.required_occurrences ?? undefined) || undefined,
    }));

  const audioAssets = (data.audio_assets ?? []).map((asset) => ({
    id: asset.id,
    assetType: asset.asset_type ?? undefined,
    storagePath: asset.storage_path ?? undefined,
    durationMs: asset.duration_ms ?? undefined,
    isTts: asset.is_tts ?? undefined,
  }));

  const scriptPlain = sanitizeScript(data.script);

  return {
    id: data.id,
    title: data.title,
    level: data.level,
    summary: data.summary ?? undefined,
    durationSeconds: data.duration_seconds ?? undefined,
    script: data.script ?? undefined,
    scriptPlain,
    sentences,
    targetWords,
    audioAssets,
  };
}

export default function useStoryDetail(storyId: string | undefined) {
  const [detail, setDetail] = useState<EpisodeDetailViewModel | null>(null);
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
      setDetail(transformEpisodeDetail(response as EpisodeDetailResponse));
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : '사연 상세를 불러오는 데 실패했습니다.',
      );
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

