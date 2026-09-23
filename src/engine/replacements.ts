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