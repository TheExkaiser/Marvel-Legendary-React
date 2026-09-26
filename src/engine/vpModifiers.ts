import type { GameState, CardInstance } from './types'

export type VpModifier = (state: GameState, self: CardInstance, pile: CardInstance[]) => number

const modifiers: Record<string, VpModifier> = {}

export function registerVpModifier(cardId: string, modifier: VpModifier): void {
  modifiers[cardId] = modifier
}

export function getVpModifier(cardId: string): VpModifier | undefined {
  return modifiers[cardId]
}