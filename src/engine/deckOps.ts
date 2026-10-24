import type { GameState, CardInstance } from './types'
import { shuffle } from './random'
import { logEvent } from './common'

/** Jeśli talia jest pusta, tasuje stos odrzuconych w nową talię. Zwraca false, gdy nie ma z czego. */
function reshuffleDiscardIntoDeck(state: GameState): boolean {
  if (state.discard.length === 0) return false
  state.deck = shuffle(state.discard)
  state.discard = []
  return true
}

/** Dobiera karty z talii; gdy talia się skończy, tasuje stos odrzuconych w nową talię. */
export function drawCards(state: GameState, count: number): void {
  const drawn: string[] = []
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0 && !reshuffleDiscardIntoDeck(state)) return
    const card = state.deck.pop()!
    state.hand.push(card)
    drawn.push(state.cards[card.cardId].name)
    state.cardsDrawnThisTurn += 1
  }
  if (drawn.length > 0) logEvent(state, `Drawn: ${drawn.join(', ')}`)
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

/** Karty już zdjęte z talii (takeTopCards) trafiają do ręki jako dobrane. */
export function drawRevealed(state: GameState, cards: CardInstance[]): void {
  state.hand.push(...cards)
  state.cardsDrawnThisTurn += cards.length
}
