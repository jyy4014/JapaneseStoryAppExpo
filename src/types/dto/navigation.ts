export type RouteName =
  | 'index'
  | 'episode/[id]'
  | 'episode/player'
  | 'words'
  | 'word/[id]'
  | 'profile'
  | 'stats'
  | 'settings'

export type TabName = 'index' | 'words' | 'profile'

export interface RouteParams {
  'episode/[id]': { id: string }
  'episode/player': { id: string }
  'word/[id]': { id: string }
}




