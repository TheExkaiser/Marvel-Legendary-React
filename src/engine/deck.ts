import type { CardInstance, DeckEntry } from './types'

export function buildDeck(entries: DeckEntry[]): CardInstance[] {
  const deck: CardInstance[] = []

  for (const { card, count } of entries) {
    for (let i = 1; i <= count; i++) {
      const nowaKarta: CardInstance = {
        instanceId: `${card.id}-${i}`,
        cardId: card.id,
      }
      deck.push(nowaKarta)
    }
  }

  return deck
}