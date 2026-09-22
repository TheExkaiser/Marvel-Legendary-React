import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'

export type CardAbility = (
  state: GameState,
  ctx: { self: CardInstance; ui: UiAdapter },
) => Promise<void>

const registry = new Map<string, CardAbility>()

export function registerCardAbility(cardId: string, ability: CardAbility): void {
  registry.set(cardId, ability)
}

export function getCardAbility(cardId: string): CardAbility | undefined {
  return registry.get(cardId)
}