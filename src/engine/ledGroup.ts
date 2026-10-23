import type { GameState } from './types'

/** Karta należy do głównej grupy złoczyńców tej gry (state.ledVillainGroup).
 * Always Leads jest wyłączony, więc to ona zastępuje "grupę przewodnią" Mastermina
 * (Four Horsemen u Apocalypse'a, Subterranea u Mole Mana itd.). */
export function isLedGroupVillain(state: GameState, card: { cardId: string }): boolean {
  const group = state.ledVillainGroup
  return group !== undefined && state.cards[card.cardId].villainGroup === group
}
