import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'

export type WoundReplacement = (
  state: GameState,
  ui: UiAdapter,
  self: CardInstance,
) => Promise<boolean>

const registry = new Map<string, WoundReplacement>()

export function registerWoundReplacement(cardId: string, fn: WoundReplacement): void {
  registry.set(cardId, fn)
}

export function getWoundReplacement(cardId: string): WoundReplacement | undefined {
  return registry.get(cardId)
}

export type DiscardReplacement = (
  state: GameState,
  ui: UiAdapter,
  self: CardInstance,
) => Promise<boolean>

const discardRegistry = new Map<string, DiscardReplacement>()

export function registerDiscardReplacement(cardId: string, fn: DiscardReplacement): void {
  discardRegistry.set(cardId, fn)
}

export function getDiscardReplacement(cardId: string): DiscardReplacement | undefined {
  return discardRegistry.get(cardId)
}

/** Opakowuje efekt Villaina / Master Strike'a / Taktyki, żeby tarcze (Impenetrable Ice Wall) wiedziały, że to efekt przeciwnika. */
export async function asEnemyEffect(state: GameState, fn: () => void | Promise<void>): Promise<void> {
  state.enemyEffectDepth = (state.enemyEffectDepth ?? 0) + 1
  try {
    await fn()
  } finally {
    state.enemyEffectDepth! -= 1
  }
}

export function isEnemyEffect(state: GameState): boolean {
  return (state.enemyEffectDepth ?? 0) > 0
}

// Tarcza przed odrzuceniem karty przez efekt przeciwnika: true = odrzucenie anulowane
const discardShields = new Map<string, DiscardReplacement>()

export function registerDiscardShield(cardId: string, fn: DiscardReplacement): void {
  discardShields.set(cardId, fn)
}

export function getDiscardShields(): [string, DiscardReplacement][] {
  return [...discardShields.entries()]
}
