import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// 컴포넌트들
import Typography from '../components/common/Typography';
import StyledButton from '../components/common/StyledButton';
import SentenceCard from '../components/common/SentenceCard';
import TargetWordList from '../components/story/TargetWordList';

// 스토어 & API
import { useStoryStore } from '../store/useStoryStore';

// 타입 & 테마
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { ApiService } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'StoryDetail'>;

interface AudioAsset {
  id: string;
  assetType?: string;
  storagePath?: string;
  durationMs?: number;
  isTts?: boolean;
}

interface TargetWord {
  id: string;
  kanji?: string;
  kana?: string;
  meaningKo?: string;
  jlptLevel?: string;
}

interface Sentence {
  id: string;
  order: number;
  jpText: string;
  koText?: string;
  startMs?: number;
  endMs?: number;
}

interface StoryDetail {
  id: string;
  title: string;
  level: string;
  summary?: string;
  targetWords: TargetWord[];
  sentences: Sentence[];
  audioAssets: AudioAsset[];
}

function AudioPlayer({
  assets,
  onGenerateTTS,
  isGeneratingTTS
}: {
  assets: AudioAsset[];
  onGenerateTTS: () => void;
  isGeneratingTTS: boolean;
}) {
  const handleGenerateTTS = async () => {
    try {
      await onGenerateTTS();
    } catch (error) {
      console.error('TTS generation failed:', error);
      alert('TTS 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.audioSection}>
      <Typography variant="title" style={styles.audioTitle}>
        🎵 스토리 오디오
      </Typography>

      {assets.length > 0 ? (
        <View style={styles.audioList}>
          {assets.map((asset, index) => (
            <View key={asset.id} style={styles.audioItem}>
              <Typography variant="body">
                오디오 {index + 1}
                {asset.isTts && ' (TTS)'}
              </Typography>
              <Typography variant="small" color={colors.textSecondary}>
                {asset.durationMs ? `${Math.round(asset.durationMs / 1000)}초` : '길이 정보 없음'}
              </Typography>
            </View>
          ))}
        </View>
      ) : (
        <Typography variant="body" color={colors.textSecondary} style={styles.noAudio}>
          오디오 파일이 없습니다.
        </Typography>
      )}

      <StyledButton
        title={isGeneratingTTS ? "생성 중..." : "🎵 일본어 음성 생성"}
        onPress={handleGenerateTTS}
        loading={isGeneratingTTS}
        style={styles.ttsButton}
      />
    </View>
  );
}

export default function StoryDetailScreen({ route, navigation }: Props) {
  const { storyId } = route.params;

  // 로컬 상태
  const [detail, setDetail] = useState<StoryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);

  // 데이터 로드
  useEffect(() => {
    const loadStoryDetail = async () => {
      try {
        console.log('[StoryDetailScreen] Loading story:', storyId);
        setIsLoading(true);
        setError(null);

        // storyId 검증
        if (!storyId || typeof storyId !== 'string' || storyId.trim() === '') {
          throw new Error('유효한 스토리 ID가 필요합니다.');
        }

        const response = await ApiService.getStoryById(storyId);

        // 응답 데이터 검증
        if (!response || typeof response !== 'object') {
          throw new Error('스토리 데이터 형식이 올바르지 않습니다.');
        }

        if (!response.id || !response.title) {
          throw new Error('스토리 필수 정보가 누락되었습니다.');
        }

        // 데이터 변환 (안전하게 처리)
        const transformedDetail: StoryDetail = {
          id: String(response.id),
          title: String(response.title),
          level: String(response.level || 'N5'),
          summary: response.summary ? String(response.summary) : undefined,
          targetWords: [],
          sentences: [],
          audioAssets: [],
        };

        // 타겟 단어 변환 (안전하게)
        try {
          if (Array.isArray(response.episode_target_words)) {
            transformedDetail.targetWords = response.episode_target_words
              .map(etw => etw?.words)
              .filter((word): word is NonNullable<typeof word> => Boolean(word?.id))
              .map(word => ({
                id: String(word.id),
                kanji: word.kanji ? String(word.kanji) : undefined,
                kana: word.kana ? String(word.kana) : undefined,
                meaningKo: word.meaning_ko ? String(word.meaning_ko) : undefined,
                jlptLevel: word.jlpt_level ? String(word.jlpt_level) : undefined,
              }));
          }
        } catch (wordError) {
          console.warn('[StoryDetailScreen] Error processing target words:', wordError);
          // 타겟 단어 로딩 실패해도 계속 진행
        }

        // 문장 변환 (안전하게)
        try {
          if (Array.isArray(response.episode_sentences)) {
            transformedDetail.sentences = response.episode_sentences
              .filter(sentence => sentence && sentence.id)
              .sort((a, b) => (a.seq_no || 0) - (b.seq_no || 0))
              .map(sentence => ({
                id: String(sentence.id),
                order: Number(sentence.seq_no) || 0,
                jpText: String(sentence.text || ''),
                koText: sentence.translation_ko ? String(sentence.translation_ko) : undefined,
                startMs: sentence.start_ms ? Number(sentence.start_ms) : undefined,
                endMs: sentence.end_ms ? Number(sentence.end_ms) : undefined,
              }));
          }
        } catch (sentenceError) {
          console.warn('[StoryDetailScreen] Error processing sentences:', sentenceError);
          // 문장 로딩 실패해도 계속 진행
        }

        // 오디오 에셋 변환 (안전하게)
        try {
          if (Array.isArray(response.audio_assets)) {
            transformedDetail.audioAssets = response.audio_assets
              .filter(asset => asset && asset.id)
              .map(asset => ({
                id: String(asset.id),
                assetType: asset.asset_type ? String(asset.asset_type) : undefined,
                storagePath: asset.storage_path ? String(asset.storage_path) : undefined,
                durationMs: asset.duration_ms ? Number(asset.duration_ms) : undefined,
                isTts: Boolean(asset.is_tts),
              }));
          }
        } catch (audioError) {
          console.warn('[StoryDetailScreen] Error processing audio assets:', audioError);
          // 오디오 로딩 실패해도 계속 진행
        }

        setDetail(transformedDetail);
        console.log('[StoryDetailScreen] Story loaded successfully');

        // 네비게이션 헤더 업데이트 (안전하게)
        try {
          if (navigation?.setOptions) {
            navigation.setOptions({
              title: transformedDetail.title,
            });
          }
        } catch (navError) {
          console.warn('[StoryDetailScreen] Error updating navigation title:', navError);
          // 네비게이션 업데이트 실패해도 계속 진행
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '스토리를 불러오는데 실패했습니다.';
        setError(errorMessage);
        console.error('[StoryDetailScreen] Error loading story:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoryDetail();
  }, [storyId, navigation]);

  // TTS 생성 핸들러
  const handleGenerateTTS = async () => {
    if (!detail) {
      alert('스토리 정보가 로드되지 않았습니다.');
      return;
    }

    try {
      setIsGeneratingTTS(true);
      console.log('[StoryDetailScreen] Generating TTS for story:', detail.id);

      // 입력 데이터 검증
      if (!detail.id || typeof detail.id !== 'string') {
        throw new Error('유효한 스토리 ID가 필요합니다.');
      }

      await ApiService.generateAudio({
        episodeId: detail.id,
        language: 'ja',
        voicePreset: 'default',
        speed: 1,
      });

      console.log('[StoryDetailScreen] TTS generation completed successfully');

      // 성공 메시지 표시
      alert('TTS가 생성되었습니다! 페이지를 새로고침하여 새로운 오디오를 확인하세요.');

    } catch (error) {
      console.error('[StoryDetailScreen] TTS generation failed:', error);

      // 사용자 친화적인 에러 메시지
      let errorMessage = 'TTS 생성에 실패했습니다.';

      if (error instanceof Error) {
        if (error.message.includes('네트워크')) {
          errorMessage = '네트워크 연결을 확인해주세요.';
        } else if (error.message.includes('인증')) {
          errorMessage = '인증 정보가 유효하지 않습니다.';
        } else if (error.message.includes('시간 초과')) {
          errorMessage = '요청이 시간 초과되었습니다. 다시 시도해주세요.';
        } else if (error.message.includes('서버')) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else {
          errorMessage = error.message;
        }
      }

      alert(errorMessage);
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Typography variant="body" style={styles.loadingText}>
          스토리를 불러오는 중...
        </Typography>
      </View>
    );
  }

  // 에러 상태
  if (error || !detail) {
    return (
      <View style={styles.error}>
        <Typography variant="body" color={colors.error}>
          {error || '스토리를 찾을 수 없습니다.'}
        </Typography>
        <StyledButton
          title="돌아가기"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 제목과 요약 */}
      <View style={styles.header}>
        <Typography variant="h1" style={styles.title}>
          {detail.title}
        </Typography>
        {detail.summary && (
          <Typography variant="body" style={styles.summary}>
            {detail.summary}
          </Typography>
        )}
      </View>

      {/* 오디오 플레이어 */}
      <AudioPlayer
        assets={detail.audioAssets}
        onGenerateTTS={handleGenerateTTS}
        isGeneratingTTS={isGeneratingTTS}
      />

      {/* 타겟 단어 */}
      <TargetWordList words={detail.targetWords} />

      {/* 문장 목록 */}
      <View style={styles.sentencesSection}>
        <Typography variant="title" style={styles.sentencesTitle}>
          📖 문장 학습
        </Typography>
        {detail.sentences.map((sentence) => (
          <SentenceCard
            key={sentence.id}
            order={sentence.order}
            jpText={sentence.jpText}
            koText={sentence.koText}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  backButton: {
    marginTop: 20,
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    marginBottom: 12,
  },
  summary: {
    color: colors.textSecondary,
    lineHeight: 24,
  },
  audioSection: {
    margin: 20,
  },
  audioTitle: {
    marginBottom: 16,
  },
  audioList: {
    marginBottom: 16,
  },
  audioItem: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noAudio: {
    textAlign: 'center',
    padding: 20,
  },
  ttsButton: {
    marginTop: 16,
  },
  sentencesSection: {
    padding: 20,
  },
  sentencesTitle: {
    marginBottom: 16,
  },
});
