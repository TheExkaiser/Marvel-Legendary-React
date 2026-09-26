import type { GameState, CardInstance } from './types'
import { shuffle } from './random'

/** Jeśli talia jest pusta, tasuje stos odrzuconych w nową talię. Zwraca false, gdy nie ma z czego. */
function reshuffleDiscardIntoDeck(state: GameState): boolean {
  if (state.discard.length === 0) return false
  state.deck = shuffle(state.discard)
  state.discard = []
  return true
}

/** Dobiera karty z talii; gdy talia się skończy, tasuje stos odrzuconych w nową talię. */
export function drawCards(state: GameState, count: number): void {
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0 && !reshuffleDiscardIntoDeck(state)) return
    const card = state.deck.pop()!
    state.hand.push(card)
  }
}

/** Zdejmuje karty z wierzchu talii (tasując discard, gdy trzeba), ale NIE dodaje ich do ręki. */
export function takeTopCards(state: GameState, count: number): CardInstance[] {
  const taken: CardInstance[] = []
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0 && !reshuffleDiscardIntoDeck(state)) break
    taken.push(state.deck.pop()!)
  }
  return taken
}

/** Podgląda wierzchnią kartę talii BEZ zdejmowania jej (tasuje discard, jeśli talia jest pusta). */
export function peekTopCard(state: GameState): CardInstance | undefined {
  if (state.deck.length === 0 && !reshuffleDiscardIntoDeck(state)) return undefined
  return state.deck[state.deck.length - 1]
}