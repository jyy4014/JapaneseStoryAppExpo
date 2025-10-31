import { create } from 'zustand'
import type { Episode, EpisodeFilters } from '../types/episode'
import { mockEpisodes } from '../mock/episodes'

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
          error: '에피소드 데이터를 불러오지 못했습니다. 모의 데이터를 표시합니다.',
          episodes: mockEpisodes,
          loading: false,
          lastUpdated: new Date().toISOString(),
        })
        return
      }

      const resolvedEpisodes = (data ?? []).length > 0 ? data : mockEpisodes

      set({
        episodes: resolvedEpisodes,
        loading: false,
        lastUpdated: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Episode service unavailable', error)
      set({
        error: '에피소드 서비스를 불러올 수 없습니다. 모의 데이터를 표시합니다.',
        episodes: mockEpisodes,
        loading: false,
        lastUpdated: new Date().toISOString(),
      })
    }
  },
  async refreshEpisodes(filters) {
    await useEpisodesStore.getState().fetchEpisodes(filters)
  },
}))


