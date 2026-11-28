import type { CardInstance, GameState } from './types'

/** `villain` to konkretna instancja (potrzebna, gdy warunek zależy od jej miejsca w mieście, np. Doop). */
export type DefeatRequirement = (state: GameState, villain?: CardInstance) => boolean

const registry = new Map<string, DefeatRequirement>()

export function registerDefeatRequirement(cardId: string, fn: DefeatRequirement): void {
  registry.set(cardId, fn)
}

export function canDefeatVillain(state: GameState, cardId: string, villain?: CardInstance): boolean {
  const fn = registry.get(cardId)
  return fn ? fn(state, villain) : true
}