import type { GameState, CardInstance } from './types'
import { refillHq } from './recruit'

/** Id kart startowych — patrz data/sets/01_Core_Set/cards.ts (STARTING_CARDS). */
const STARTING_CARD_IDS = ['shield-agent', 'shield-trooper']

/** DEBUG: bohaterowie z HQ wracają na spód talii bohaterów (index 0 = spód), HQ dobiera nowych. */
export function debugReplaceAllHeroesInHq(state: GameState): void {
  for (let i = 0; i < state.hq.length; i++) {
    const instance = state.hq[i]
    if (instance) {
      state.heroDeck.unshift(instance)
      state.hq[i] = null
    }
  }
  refillHq(state)
}

/** DEBUG: wszystkie karty startowe (agent/trooper) z ręki, zagranych, discardu i talii trafiają do KO. */
export function debugRemoveAllStartingCards(state: GameState): void {
  const piles: CardInstance[][] = [state.hand, state.played, state.discard, state.deck]
  for (const pile of piles) {
    for (let i = pile.length - 1; i >= 0; i--) {
      if (STARTING_CARD_IDS.includes(pile[i].cardId)) {
        state.ko.push(...pile.splice(i, 1))
      }
    }
  }
}