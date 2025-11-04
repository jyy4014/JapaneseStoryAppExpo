import { useState, useRef, useEffect, useCallback } from 'react'
import { EpisodeService } from '../services/episodeService'
import type { Episode } from '../types/dto'

export function useAudioPlayer(episodeId: string | null | undefined) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)

  // 오디오 URL 로드
  const loadAudio = useCallback(async () => {
    if (!episodeId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await EpisodeService.getOrGenerateAudio(episodeId)

      if (error) {
        console.warn('Audio load failed:', error)
        setError('오디오를 불러오지 못했어요.')
        return
      }

      if (data?.audioUrl) {
        setAudioUrl(data.audioUrl)
        setDuration(data.duration / 1000) // ms to seconds
      }
    } catch (err) {
      console.error('Audio loading error:', err)
      setError('오디오 로딩 중 오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }, [episodeId])

  // 오디오 초기화
  useEffect(() => {
    if (episodeId) {
      loadAudio()
    }
  }, [episodeId, loadAudio])

  // 재생/일시정지 토글
  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  // 시간 업데이트 핸들러
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }, [])

  // 탐색
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  // 재생 종료 핸들러
  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

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
    loading,
    error,
    togglePlayback,
    seekTo,
    formatTime,
    handleTimeUpdate,
    handleEnded,
    reloadAudio: loadAudio
  }
}
