import type { Database } from '../services/supabase'

export type EpisodeRow = Database['public']['Tables']['episodes']['Row']
export type SentenceRow = Database['public']['Tables']['sentences']['Row']
export type EpisodeProgressRow = Database['public']['Tables']['episode_progress']['Row']

export type Episode = EpisodeRow & {
  sentences?: SentenceRow[]
  progress?: EpisodeProgressRow | null
}

export interface EpisodeFilters {
  difficulty?: number
  genre?: string
  category?: string
  limit?: number
  offset?: number
}


