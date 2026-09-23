import type { GameState } from './types'

export type DefeatRequirement = (state: GameState) => boolean

const registry = new Map<string, DefeatRequirement>()

export function registerDefeatRequirement(cardId: string, fn: DefeatRequirement): void {
  registry.set(cardId, fn)
}

export function canDefeatVillain(state: GameState, cardId: string): boolean {
  const fn = registry.get(cardId)
  return fn ? fn(state) : true
}