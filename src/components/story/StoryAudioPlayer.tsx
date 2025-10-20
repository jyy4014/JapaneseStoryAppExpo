import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Audio, AVPlaybackStatusSuccess } from 'expo-av';
import StyledButton from '../common/StyledButton';
import Typography from '../common/Typography';
import { colors } from '../../theme/colors';
import { getSupabaseStorageBaseUrl } from '../../services/api';

export interface StoryAudioAsset {
  id: string;
  storagePath?: string;
  durationMs?: number;
  isTts?: boolean;
}

interface StoryAudioPlayerProps {
  title?: string;
  assets: StoryAudioAsset[];
  storageBaseUrl?: string;
}

function formatDuration(ms?: number) {
  if (!ms) {
    return '재생 시간 정보 없음';
  }

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function StoryAudioPlayer({ title = '오디오', assets, storageBaseUrl }: StoryAudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState<number>(0);

  const currentAsset = assets.find((asset) => asset.storagePath);

  const sourceUrl = useMemo(() => {
    if (!currentAsset?.storagePath) {
      return undefined;
    }

    const baseUrl = storageBaseUrl ?? getSupabaseStorageBaseUrl();
    return `${baseUrl.replace(/\/$/, '')}/${currentAsset.storagePath.replace(/^\//, '')}`;
  }, [currentAsset?.storagePath, storageBaseUrl]);

  useEffect(() => {
    return () => {
      void (async () => {
        if (sound) {
          await sound.unloadAsync();
        }
      })();
    };
  }, [sound]);

  useEffect(() => {
    if (!sound) {
      return;
    }

    const subscription = sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) {
        return;
      }

      setPlaybackPosition(status.positionMillis ?? 0);

      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    });

    return () => {
      sound.setOnPlaybackStatusUpdate(null);
    };
  }, [sound]);

  const handlePlay = useCallback(async () => {
    if (!sourceUrl) {
      return;
    }

    try {
      setIsLoading(true);

      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound, status } = await Audio.Sound.createAsync({ uri: sourceUrl }, { shouldPlay: true });
      if ((status as AVPlaybackStatusSuccess).isLoaded) {
        setIsPlaying(true);
      }
      setSound(newSound);
    } catch (error) {
      console.error('[StoryAudioPlayer] play error', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [sound, sourceUrl]);

  const handlePause = useCallback(async () => {
    if (!sound) {
      return;
    }

    try {
      await sound.pauseAsync();
      setIsPlaying(false);
    } catch (error) {
      console.error('[StoryAudioPlayer] pause error', error);
    }
  }, [sound]);

  const handleResume = useCallback(async () => {
    if (!sound) {
      return;
    }

    try {
      await sound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('[StoryAudioPlayer] resume error', error);
    }
  }, [sound]);

  if (!currentAsset || !sourceUrl) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Typography variant="subtitle" style={styles.title}>
        {title}
      </Typography>

      <Typography variant="body" color={colors.textSecondary}>
        {currentAsset.isTts ? 'TTS 오디오' : '녹음 오디오'} • {formatDuration(currentAsset.durationMs)}
      </Typography>

      <View style={styles.actions}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : isPlaying ? (
          <StyledButton title="일시정지" onPress={handlePause} />
        ) : sound ? (
          <StyledButton title="계속 재생" onPress={handleResume} />
        ) : (
          <StyledButton title="재생" onPress={handlePlay} />
        )}
      </View>

      <Typography variant="caption" color={colors.textSecondary}>
        재생 위치: {(playbackPosition / 1000).toFixed(1)}초
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    marginBottom: 8,
  },
  actions: {
    marginTop: 16,
    marginBottom: 8,
  },
});

export default StoryAudioPlayer;

