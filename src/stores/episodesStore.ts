import { create } from 'zustand'
import type { Episode, EpisodeFilter as EpisodeFilters } from '../types/dto'

interface EpisodesState {
  episodes: Episode[]
  loading: boolean
  error: string | null
  lastUpdated: string | null
  fetchEpisodes: (filters?: EpisodeFilters) => Promise<void>
  refreshEpisodes: (filters?: EpisodeFilters) => Promise<void>
}

export const useEpisodesStore = create<EpisodesState>((set) => ({
  episodes: [],
  loading: false,
  error: null,
  lastUpdated: null,
  async fetchEpisodes(filters) {
    set({ loading: true, error: null })
    try {
      const { EpisodeService } = await import('../services/episodeService')
      const { data, error } = await EpisodeService.getEpisodes(filters)

      if (error) {
        console.error('Episode fetch failed', error)
        set({
          error: '에피소드를 불러오지 못했어요. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
          episodes: [],
          loading: false,
          lastUpdated: new Date().toISOString(),
        })
        return
      }

      set({
        episodes: data || [],
        loading: false,
        lastUpdated: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Episode service unavailable', error)
      set({
        error: '에피소드를 불러오지 못했어요. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
        episodes: [],
        loading: false,
        lastUpdated: new Date().toISOString(),
      })
    }
  },
  async refreshEpisodes(filters) {
    await useEpisodesStore.getState().fetchEpisodes(filters)
  },
}))
