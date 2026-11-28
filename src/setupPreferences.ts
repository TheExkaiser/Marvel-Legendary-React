import type { HeroSelectionMode } from './engine/types'

export type SetupSortMode = 'alpha' | 'set' | 'team'

export interface SetupPreferences {
  enabledSetIds: string[]
  gameModeId: string
  sidekicksEnabled?: boolean
  excludedBystanderGroupIds: string[]
  heroSelectionMode: HeroSelectionMode
  uniqueHeroRealNames: boolean
  sortMode: SetupSortMode
  teamFilter: string[]
  setFilter: string
  selectedOnly: boolean
  query: string
}

const STORAGE_KEY = 'marvel-legendary-setup-preferences'

export function readSetupPreferences(): Partial<SetupPreferences> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const value = JSON.parse(raw) as Partial<SetupPreferences>
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

export function writeSetupPreferences(preferences: SetupPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Private browsing / blocked storage: setup remains usable in memory.
  }
}
