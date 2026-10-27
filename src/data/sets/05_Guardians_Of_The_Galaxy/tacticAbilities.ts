/* Wzór z PTTR
import { registerCardAbility } from '../../../engine/cardAbilities'
import { feastTopCard } from '../../../engine/feast'
import { addRecruit, rescueBystander } from '../../../engine/game'
import { peekTopCard } from '../../../engine/deckOps'
import { resolveVillainDeckCard } from '../../../engine/villainPhase'
import { shuffle } from '../../../engine/random'

const isZeroCostHero = (state: Parameters<typeof feastTopCard>[0], card: { cardId: string }) =>
  !!state.cards[card.cardId].hero && (state.cards[card.cardId].cost ?? 0) === 0

registerCardAbility('carnage-drooling-jaws', async (state, { ui }) => {
  const top = peekTopCard(state)
  if (top) await ui.revealCard(top, 'Drooling Jaws: revealed the top card')
  await feastTopCard(state, ui, 'Carnage')
})
*/