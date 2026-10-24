import type { CardInstance, GameState } from './types'
import type { UiAdapter } from './ui'

/** Feast: KO the top card of the player's deck and return what was feasted on. */
export async function feastTopCard(
  state: GameState,
  ui: UiAdapter,
  label: string,
): Promise<CardInstance | undefined> {
  const card = state.deck.pop()
  if (!card) return undefined
  state.ko.push(card)
  await ui.revealCard(card, `${label} feasts on ${state.cards[card.cardId].name}`)
  return card
}
