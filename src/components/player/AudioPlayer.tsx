import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, spacing, typography } from '../../constants/theme'
import { usePlayerStore } from '../../stores/playerStore'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import type { BaseComponentProps } from '../../types/dto'

interface AudioPlayerProps extends BaseComponentProps {
  episodeId: string
  onClose?: () => void
}

export function AudioPlayer({ episodeId, onClose }: AudioPlayerProps) {
  if (__DEV__) {
    console.log('[AudioPlayer] Component rendered with episodeId:', episodeId)
  }
  
  const {
    audioUrl,
    audioRef,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    loading,
    error,
    togglePlayback,
    seekTo,
    skipForward,
    skipBackward,
    formatTime,
    handleTimeUpdate,
    handleEnded,
    handleWaiting,
    handleCanPlay,
  } = useAudioPlayer(episodeId)
  
  if (__DEV__) {
    console.log('[AudioPlayer] State:', { episodeId, audioUrl, loading, error })
  }

  const { 
    setPlaybackRate, 
    abStart, 
    abEnd, 
    setAbStart, 
    setAbEnd, 
    isAbRepeatActive,
    toggleAbRepeat,
    clearAbRepeat 
  } = usePlayerStore()

  // 오디오 엘리먼트 초기화 (웹 환경에서 DOM에 직접 추가)
  useEffect(() => {
    if (typeof document === 'undefined' || !audioUrl) {
      if (__DEV__) {
        console.log('[AudioPlayer] Skipping audio element creation:', { hasDocument: typeof document !== 'undefined', audioUrl })
      }
      return
    }
    
    if (__DEV__) {
      console.log('[AudioPlayer] Creating audio element with URL:', audioUrl)
    }
    
    // 웹 환경: DOM에 직접 audio 엘리먼트 추가
    // 기존 audio 엘리먼트 제거
    const existing = document.getElementById('audio-player-element') as HTMLAudioElement
    if (existing) {
      if (__DEV__) {
        console.log('[AudioPlayer] Removing existing audio element')
      }
      existing.remove()
    }
    
    // 새 audio 엘리먼트 생성
    const audioElement = document.createElement('audio')
    audioElement.id = 'audio-player-element'
    audioElement.style.display = 'none'
    audioElement.src = audioUrl
    audioElement.preload = 'auto'
    
    // 이벤트 리스너 추가
    audioElement.addEventListener('timeupdate', handleTimeUpdate)
    audioElement.addEventListener('ended', handleEnded)
    audioElement.addEventListener('waiting', handleWaiting)
    audioElement.addEventListener('canplay', handleCanPlay)
    
    document.body.appendChild(audioElement)
    audioRef.current = audioElement
    
    if (__DEV__) {
      console.log('[AudioPlayer] Audio element created and added to DOM:', { id: audioElement.id, src: audioElement.src })
    }
    
    // Cleanup
    return () => {
      if (audioElement && audioElement.parentNode) {
        if (__DEV__) {
          console.log('[AudioPlayer] Cleaning up audio element')
        }
        audioElement.removeEventListener('timeupdate', handleTimeUpdate)
        audioElement.removeEventListener('ended', handleEnded)
        audioElement.removeEventListener('waiting', handleWaiting)
        audioElement.removeEventListener('canplay', handleCanPlay)
        audioElement.remove()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]) // audioUrl만 dependency로 사용

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={lavenderPalette.primary} />
        <Text style={styles.loadingText}>오디오를 불러오는 중...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <View style={styles.container}>
      {/* Audio element is created in useEffect for web compatibility */}

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            
            {/* A-B 마커 */}
            {abStart !== null && (
              <View style={[styles.abMarker, styles.abMarkerA, { left: `${(abStart / duration) * 100}%` }]} />
            )}
            {abEnd !== null && (
              <View style={[styles.abMarker, styles.abMarkerB, { left: `${(abEnd / duration) * 100}%` }]} />
            )}
          </View>
        </View>
      </View>

      {/* Main Controls */}
      <View style={styles.controlsSection}>
        {/* Skip Back */}
        <TouchableOpacity style={styles.controlButton} onPress={skipBackward}>
          <Ionicons name="play-back" size={28} color={lavenderPalette.text} />
          <Text style={styles.controlLabel}>-10s</Text>
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={48} 
            color={lavenderPalette.surface} 
          />
        </TouchableOpacity>

        {/* Skip Forward */}
        <TouchableOpacity style={styles.controlButton} onPress={skipForward}>
          <Ionicons name="play-forward" size={28} color={lavenderPalette.text} />
          <Text style={styles.controlLabel}>+10s</Text>
        </TouchableOpacity>
      </View>

      {/* Secondary Controls */}
      <View style={styles.secondaryControls}>
        {/* Playback Speed */}
        <View style={styles.speedControl}>
          <Text style={styles.secondaryLabel}>속도</Text>
          <View style={styles.speedButtons}>
            {[0.75, 1.0, 1.25, 1.5].map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedButton,
                  playbackRate === speed && styles.speedButtonActive
                ]}
                onPress={() => setPlaybackRate(speed)}
              >
                <Text style={[
                  styles.speedButtonText,
                  playbackRate === speed && styles.speedButtonTextActive
                ]}>
                  {speed}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* A-B Repeat */}
        <View style={styles.abControl}>
          <Text style={styles.secondaryLabel}>A-B 반복</Text>
          <View style={styles.abButtons}>
            <TouchableOpacity
              style={[styles.abButton, abStart !== null && styles.abButtonActive]}
              onPress={() => setAbStart(currentTime)}
            >
              <Text style={styles.abButtonText}>A</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.abButton, abEnd !== null && styles.abButtonActive]}
              onPress={() => setAbEnd(currentTime)}
            >
              <Text style={styles.abButtonText}>B</Text>
            </TouchableOpacity>

            {abStart !== null && abEnd !== null && (
              <TouchableOpacity
                style={[styles.abToggle, isAbRepeatActive && styles.abToggleActive]}
                onPress={toggleAbRepeat}
              >
                <Ionicons 
                  name={isAbRepeatActive ? 'repeat' : 'repeat-outline'} 
                  size={20} 
                  color={isAbRepeatActive ? lavenderPalette.surface : lavenderPalette.primary} 
                />
              </TouchableOpacity>
            )}

            {(abStart !== null || abEnd !== null) && (
              <TouchableOpacity style={styles.abClear} onPress={clearAbRepeat}>
                <Ionicons name="close-circle" size={20} color={lavenderPalette.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: lavenderPalette.surface,
    borderTopWidth: 1,
    borderTopColor: '#EBE3FF',
    gap: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: '#EF4444',
    textAlign: 'center',
  },
  
  // Progress Section
  progressSection: {
    gap: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 13,
    color: lavenderPalette.textSecondary,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 40,
    justifyContent: 'center',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#EBE3FF',
    borderRadius: 3,
    position: 'relative',
    overflow: 'visible',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: lavenderPalette.primary,
    borderRadius: 3,
  },
  abMarker: {
    position: 'absolute',
    top: -6,
    width: 3,
    height: 18,
    borderRadius: 2,
  },
  abMarkerA: {
    backgroundColor: '#10B981',
  },
  abMarkerB: {
    backgroundColor: '#EF4444',
  },

  // Main Controls
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  controlButton: {
    alignItems: 'center',
    gap: 4,
  },
  controlLabel: {
    fontSize: 11,
    color: lavenderPalette.textSecondary,
    fontWeight: '600',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: lavenderPalette.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  // Secondary Controls
  secondaryControls: {
    gap: spacing.md,
  },
  secondaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: lavenderPalette.text,
    marginBottom: spacing.xs,
  },

  // Speed Control
  speedControl: {
    gap: spacing.xs,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  speedButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: '#EBE3FF',
    backgroundColor: lavenderPalette.surface,
    alignItems: 'center',
  },
  speedButtonActive: {
    borderColor: lavenderPalette.primary,
    backgroundColor: lavenderPalette.primaryLight,
  },
  speedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: lavenderPalette.textSecondary,
  },
  speedButtonTextActive: {
    color: lavenderPalette.primaryDark,
  },

  // A-B Repeat
  abControl: {
    gap: spacing.xs,
  },
  abButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  abButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#EBE3FF',
    backgroundColor: lavenderPalette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abButtonActive: {
    borderColor: lavenderPalette.primary,
    backgroundColor: lavenderPalette.primaryLight,
  },
  abButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: lavenderPalette.text,
  },
  abToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: lavenderPalette.primary,
    backgroundColor: lavenderPalette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abToggleActive: {
    backgroundColor: lavenderPalette.primary,
  },
  abClear: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

