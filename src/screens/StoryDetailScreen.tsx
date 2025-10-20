import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import StyledButton from '../components/common/StyledButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SentenceCard from '../components/common/SentenceCard';
import Typography from '../components/common/Typography';
import TargetWordList from '../components/story/TargetWordList';
import StoryAudioPlayer from '../components/story/StoryAudioPlayer';
import useStoryDetail from '../hooks/useStoryDetail';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'StoryDetail'>;

function StoryDetailScreen({ route, navigation }: Props) {
  const { storyId } = route.params;
  const { detail, isLoading, error, fetchDetail } = useStoryDetail(storyId);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: detail?.title ?? '사연 상세',
      headerBackVisible: true,
    });
  }, [detail?.title, navigation]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Typography variant="body" color={colors.secondary}>
          {error}
        </Typography>
        <StyledButton title="다시 시도" onPress={fetchDetail} style={styles.retryButton} />
      </View>
    );
  }

  if (!detail) {
    return null;
  }

  const audioAssets = detail.audioAssets.filter((asset) => asset.storagePath);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Typography variant="subtitle" color={colors.textSecondary}>
        {detail.level} 레벨 • 약 {detail.durationSeconds ? Math.ceil(detail.durationSeconds / 60) : '?'}분
      </Typography>

      {detail.summary ? (
        <Typography variant="body" style={styles.summary}>
          {detail.summary}
        </Typography>
      ) : null}

      {audioAssets.length > 0 ? (
        <StoryAudioPlayer
          title="스토리 오디오"
          assets={audioAssets}
        />
      ) : (
        <View style={styles.audioPlaceholder}>
          <Typography variant="body" color={colors.textSecondary}>
            아직 업로드된 오디오가 없습니다.
          </Typography>
        </View>
      )}

      <TargetWordList
        words={detail.targetWords.map((word) => ({
          id: word.id,
          kanji: word.kanji,
          kana: word.kana,
          meaningKo: word.meaningKo ?? '의미 미등록',
        }))}
      />

      <View style={styles.sentenceList}>
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
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  retryButton: {
    marginTop: 16,
  },
  summary: {
    marginTop: 12,
    marginBottom: 16,
  },
  audioPlaceholder: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  sentenceList: {
    marginTop: 8,
  },
});

export default StoryDetailScreen;

