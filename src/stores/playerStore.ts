import { create } from 'zustand'

export interface PlayerState {
  // 현재 재생 중인 에피소드
  currentEpisodeId: string | null
  
  // 재생 상태
  isPlaying: boolean
  currentTime: number // seconds
  duration: number // seconds
  playbackRate: number // 0.75 ~ 1.5
  
  // A-B 반복
  abStart: number | null // seconds
  abEnd: number | null // seconds
  isAbRepeatActive: boolean
  
  // 버퍼링
  isBuffering: boolean
  
  // 액션
  setEpisode: (id: string) => void
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => boolean // A-B 반복 체크 결과 반환
  setDuration: (duration: number) => void
  setPlaybackRate: (rate: number) => void
  setAbStart: (time: number | null) => void
  setAbEnd: (time: number | null) => void
  toggleAbRepeat: () => void
  clearAbRepeat: () => void
  setBuffering: (buffering: boolean) => void
  reset: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // 초기 상태
  currentEpisodeId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1.0,
  abStart: null,
  abEnd: null,
  isAbRepeatActive: false,
  isBuffering: false,

  // 액션
  setEpisode: (id) => set({ 
    currentEpisodeId: id,
    currentTime: 0,
    abStart: null,
    abEnd: null,
    isAbRepeatActive: false
  }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setCurrentTime: (time) => {
    const state = get()
    set({ currentTime: time })
    
    // A-B 반복 체크 - B 지점 도달 시 true 반환
    if (state.isAbRepeatActive && state.abStart !== null && state.abEnd !== null) {
      return time >= state.abEnd
    }
    return false
  },

  setDuration: (duration) => set({ duration }),

  setPlaybackRate: (rate) => {
    // 0.75 ~ 1.5 범위로 제한
    const clampedRate = Math.max(0.75, Math.min(1.5, rate))
    set({ playbackRate: clampedRate })
  },

  setAbStart: (time) => set({ abStart: time }),

  setAbEnd: (time) => set({ abEnd: time }),

  toggleAbRepeat: () => {
    const state = get()
    if (state.abStart !== null && state.abEnd !== null) {
      set({ isAbRepeatActive: !state.isAbRepeatActive })
    }
  },

  clearAbRepeat: () => set({ 
    abStart: null, 
    abEnd: null, 
    isAbRepeatActive: false 
  }),

  setBuffering: (buffering) => set({ isBuffering: buffering }),

  reset: () => set({
    currentEpisodeId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    abStart: null,
    abEnd: null,
    isAbRepeatActive: false,
    isBuffering: false,
  }),
}))

