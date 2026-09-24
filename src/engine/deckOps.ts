import type { GameState, CardInstance } from './types'
import { shuffle } from './random'

/** Dobiera karty z talii; gdy talia się skończy, tasuje stos odrzuconych w nową talię. */
export function drawCards(state: GameState, count: number): void {
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) {
      if (state.discard.length === 0) return
      state.deck = shuffle(state.discard)
      state.discard = []
    }
    const card = state.deck.pop()!
    state.hand.push(card)
  }
}

/** Zdejmuje karty z wierzchu talii (tasując discard, gdy trzeba), ale NIE dodaje ich do ręki. */
export function takeTopCards(state: GameState, count: number): CardInstance[] {
  const taken: CardInstance[] = []
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) {
      if (state.discard.length === 0) break
      state.deck = shuffle(state.discard)
      state.discard = []
    }
    taken.push(state.deck.pop()!)
  }
  return taken
}
