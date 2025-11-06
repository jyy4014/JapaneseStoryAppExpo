import { useState, useEffect, useCallback } from 'react'
import { EpisodeService } from '../services/episodeService'
import type { Episode } from '../types/dto'

export function useEpisodeData(episodeId: string | null | undefined) {
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEpisode = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await EpisodeService.getEpisode(id)

      if (error) {
        if (__DEV__) {
          console.warn('Episode detail fetch failed', error)
        }
        setError('에피소드를 불러오지 못했어요. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.')
        setEpisode(null)
      } else if (!data) {
        setError('해당 에피소드를 찾을 수 없습니다.')
        setEpisode(null)
      } else {
        setEpisode(data)
        setError(null)
      }
    } catch (err) {
      if (__DEV__) {
        console.error('Episode detail load error:', err)
      }
      setError('에피소드를 불러오지 못했어요. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.')
      setEpisode(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!episodeId) {
      setError('잘못된 에피소드 요청입니다.')
      setLoading(false)
      return
    }

    loadEpisode(episodeId)
  }, [episodeId, loadEpisode])

  const refresh = useCallback(() => {
    if (episodeId) {
      loadEpisode(episodeId)
    }
  }, [episodeId, loadEpisode])

  return {
    episode,
    loading,
    error,
    refresh,
  }
}
