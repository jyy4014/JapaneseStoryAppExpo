import { ApiClient, type ApiError } from './apiClient'
import type { Episode, EpisodeFilter as EpisodeFilters, EpisodeListResponse } from '../types/dto'

export interface AudioResponse {
  audioUrl: string
  duration: number
  source: 'existing' | 'generated'
}

export class EpisodeService {
  static async getEpisodes(
    filters?: EpisodeFilters,
    userId?: string,
  ): Promise<{ data: Episode[] | null; error: ApiError | null }> {
    const query = filters
      ? {
          difficulty: filters.difficulty,
          genre: filters.genre,
          category: filters.category,
          limit: filters.limit,
          offset: filters.offset,
          ...(userId ? { userId } : {}),
        }
      : userId
        ? { userId }
        : undefined

    const { data, error } = await ApiClient.get<EpisodeListResponse>('/episodes', query)

    if (error) {
      return { data: null, error }
    }

    const episodes = data?.episodes ?? []

    if (episodes.length === 0) {
      return { data: [], error: null }
    }

    return { data: episodes, error: null }
  }

  static async getEpisode(id: string): Promise<{ data: Episode | null; error: ApiError | null }> {
    if (!id) {
      return { data: null, error: { message: 'Invalid episode id' } }
    }

    const { data, error } = await ApiClient.get<{ episode?: Episode }>(`/episodes/${id}`)

    if (error) {
      return { data: null, error }
    }

    if (!data?.episode) {
      return { data: null, error: { message: 'Episode not found' } }
    }

    return { data: data.episode, error: null }
  }

  static async getOrGenerateAudio(episodeId: string): Promise<{ data: AudioResponse | null; error: ApiError | null }> {
    if (!episodeId) {
      return { data: null, error: { message: 'Invalid episode id' } }
    }

    const { data, error } = await ApiClient.post<AudioResponse>(`/episodes/${episodeId}/audio`, {})

    if (error) {
      return { data: null, error }
    }

    return { data: data ?? null, error: null }
  }
}
