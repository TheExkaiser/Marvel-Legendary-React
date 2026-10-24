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

registerCardAbility('carnage-endless-hunger', async (state, { ui }) => {
  let feasted = await feastTopCard(state, ui, 'Carnage')
  while (feasted && isZeroCostHero(state, feasted)) feasted = await feastTopCard(state, ui, 'Carnage')
})

registerCardAbility('carnage-feed-me', async (state, { ui }) => {
  const feasted = await feastTopCard(state, ui, 'Carnage')
  if (feasted) addRecruit(state, state.cards[feasted.cardId].cost ?? 0)
})

registerCardAbility('carnage-om-nom-nom', async (state, { ui }) => {
  const feasted = await feastTopCard(state, ui, 'Carnage')
  // In the current solo mode there are no "other players" to process.
  if (feasted && isZeroCostHero(state, feasted)) return
})

registerCardAbility('mysterio-blurring-images', async (state) => {
  addRecruit(state, state.tactics.length)
})

registerCardAbility('mysterio-captive-audience', async (state, { ui }) => {
  for (let i = 0; i < state.tactics.length; i++) await rescueBystander(state, ui)
})

registerCardAbility('mysterio-master-of-illusions', async (state, { ui }) => {
  // In solo mode the player's Victory Pile is the only "other player's"
  // Victory Pile available. Return one converted Master Strike Tactic to the
  // face-down Tactics, then shuffle the stack.
  const index = state.defeated.findIndex((card) => card.cardId === 'mysterio-master-strike-tactic')
  if (index === -1) return

  const [tactic] = state.defeated.splice(index, 1)
  state.tactics = shuffle([...state.tactics, tactic])
  await ui.showInfo(tactic, 'Master of Illusions: a Master Strike Tactic returns to Mysterio’s Tactics')
})

registerCardAbility('mysterio-mists-of-deception', async (state, { ui }) => {
  if (state.tactics.length === 0) return
  const revealed = [] as typeof state.villainDeck
  for (let i = 0; i < 5; i++) {
    const card = state.villainDeck.pop()
    if (card) revealed.push(card)
  }
  const rest = [] as typeof state.villainDeck
  for (const card of revealed) {
    const isMasterStrike = card.cardId === 'masterstrike' || state.cards[card.cardId].kind === 'masterstrike'
    if (isMasterStrike) {
      await resolveVillainDeckCard(state, card, ui)
    } else {
      await ui.revealCard(card, `Mists of Deception: revealed ${state.cards[card.cardId].name}`)
      rest.push(card)
    }
  }
  state.villainDeck.unshift(...shuffle(rest))
})

registerCardAbility('mysterio-master-strike-tactic', async () => {
  // The converted Master Strike is a blank 6 VP Tactic.
})
