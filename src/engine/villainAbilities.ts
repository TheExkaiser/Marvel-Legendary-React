import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'

export interface VillainAbilities {
  onAmbush?: (state: GameState, ui: UiAdapter, self: CardInstance) => Promise<void>
  onFight?: (state: GameState, ui: UiAdapter, self: CardInstance) => Promise<void>
  onEscape?: (state: GameState, ui: UiAdapter, self: CardInstance) => Promise<void>
}

const registry = new Map<string, VillainAbilities>()

export function registerVillainAbilities(cardId: string, abilities: VillainAbilities): void {
  registry.set(cardId, abilities)
}

export function getVillainAbilities(cardId: string): VillainAbilities | undefined {
  return registry.get(cardId)
}