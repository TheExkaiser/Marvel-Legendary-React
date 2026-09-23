import type { GameState } from './types'

// Zwraca true, jeśli kartę wolno zagrać (np. czy jest co odrzucić jako koszt)
export type PlayRequirement = (state: GameState) => boolean

const registry = new Map<string, PlayRequirement>()

export function registerPlayRequirement(cardId: string, fn: PlayRequirement): void {
  registry.set(cardId, fn)
}

export function canPlayCard(state: GameState, cardId: string): boolean {
  const fn = registry.get(cardId)
  return fn ? fn(state) : true
}