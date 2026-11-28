import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'

export interface VillainAbilities {
  onAmbush?: (
    state: GameState,
    ui: UiAdapter,
    self: CardInstance,
    context: { emptyCitySpacesBeforeEntry: number },
  ) => Promise<void>
  onFeast?: (state: GameState, ui: UiAdapter, self: CardInstance, feasted: CardInstance) => Promise<void>
  onFight?: (state: GameState, ui: UiAdapter, self: CardInstance) => Promise<void>
  /** Po tym, jak Villain trafił do Victory Pile ("Fight: (After this goes to your Victory Pile.)", Fateful Resurrection). */
  onDefeated?: (state: GameState, ui: UiAdapter, self: CardInstance) => Promise<void>
  onEscape?: (
    state: GameState,
    ui: UiAdapter,
    self: CardInstance,
    lostCaptives: CardInstance[],
  ) => Promise<void>
}

const registry = new Map<string, VillainAbilities>()

export function registerVillainAbilities(cardId: string, abilities: VillainAbilities): void {
  registry.set(cardId, abilities)
}

export function getVillainAbilities(cardId: string): VillainAbilities | undefined {
  return registry.get(cardId)
}
