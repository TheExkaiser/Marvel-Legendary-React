import type { GameState, CardInstance } from './types'

type StrengthModifier = (state: GameState, self: CardInstance) => number
const modifiers = new Map<string, StrengthModifier>()

/** Modyfikator siły przypisany do konkretnej karty (np. "+2 Attack za każdego Bystandera"). */
export function registerStrengthModifier(cardId: string, fn: StrengthModifier): void {
  modifiers.set(cardId, fn)
}

export function getStrengthModifier(cardId: string): StrengthModifier | undefined {
  return modifiers.get(cardId)
}