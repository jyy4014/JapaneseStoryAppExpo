import { useState, useRef, useEffect, useCallback } from 'react'
import { EpisodeService } from '../services/episodeService'
import { usePlayerStore } from '../stores/playerStore'
import type { Episode } from '../types/dto'

export function useAudioPlayer(episodeId: string | null | undefined) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Store에서 상태 가져오기
  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    setPlaying,
    setCurrentTime,
    setDuration,
    setBuffering,
    abStart,
    abEnd,
    isAbRepeatActive,
  } = usePlayerStore()

  // 오디오 URL 로드
  const loadAudio = useCallback(async () => {
    if (!episodeId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await EpisodeService.getOrGenerateAudio(episodeId)

      if (error) {
        if (__DEV__) {
          console.warn('Audio load failed:', error)
        }
        setError('오디오를 불러오지 못했어요.')
        return
      }

      if (data?.audioUrl) {
        if (__DEV__) {
          console.log('[useAudioPlayer] Audio URL loaded:', data.audioUrl)
        }
        setAudioUrl(data.audioUrl)
        setDuration(data.duration / 1000) // ms to seconds
      } else {
        if (__DEV__) {
          console.warn('[useAudioPlayer] No audio URL in response:', data)
        }
      }
    } catch (err) {
      if (__DEV__) {
        console.error('Audio loading error:', err)
      }
      setError('오디오 로딩 중 오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }, [episodeId, setDuration])

  // 오디오 초기화
  useEffect(() => {
    // episodeId가 변경되면 audioUrl 초기화
    setAudioUrl(null)
    setError(null)
    
    if (episodeId) {
      if (__DEV__) {
        console.log('[useAudioPlayer] Loading audio for episode:', episodeId)
      }
      loadAudio()
    }
  }, [episodeId, loadAudio])

  // 재생 속도 적용
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  // 재생/일시정지 토글
  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }, [isPlaying, setPlaying])

  // 시간 업데이트 핸들러
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const shouldJumpToStart = setCurrentTime(audioRef.current.currentTime)
      
      // A-B 반복: B 지점 도달 시 A로 돌아가기
      if (shouldJumpToStart && abStart !== null) {
        audioRef.current.currentTime = abStart
      }
    }
  }, [setCurrentTime, abStart])

  // 탐색
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      const clampedTime = Math.max(0, Math.min(time, duration))
      audioRef.current.currentTime = clampedTime
      setCurrentTime(clampedTime)
    }
  }, [duration, setCurrentTime])

  // 10초 점프
  const skip = useCallback((seconds: number) => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime + seconds
      seekTo(newTime)
    }
  }, [seekTo])

  const skipForward = useCallback(() => skip(10), [skip])
  const skipBackward = useCallback(() => skip(-10), [skip])

  // 재생 종료 핸들러
  const handleEnded = useCallback(() => {
    setPlaying(false)
    
    // A-B 반복 중이면 A로 돌아가기
    if (isAbRepeatActive && abStart !== null) {
      seekTo(abStart)
      if (audioRef.current) {
        audioRef.current.play()
      }
    }
  }, [setPlaying, isAbRepeatActive, abStart, seekTo])

  // 버퍼링 핸들러
  const handleWaiting = useCallback(() => {
    setBuffering(true)
  }, [setBuffering])

  const handleCanPlay = useCallback(() => {
    setBuffering(false)
  }, [setBuffering])

  // 시간 포맷팅 유틸리티
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  return {
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
    reloadAudio: loadAudio
  }
}
