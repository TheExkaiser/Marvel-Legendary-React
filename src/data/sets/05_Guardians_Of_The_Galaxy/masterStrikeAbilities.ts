import { registerCardAbility } from '../../../engine/cardAbilities'
import { discardCard } from '../../../engine/keywords'
import { placeShardsOn, shardsOn } from '../../../engine/shards'
import type { CardInstance, GameState } from '../../../engine/types'
import { feastTopCard } from '../../../engine/feast'
import { gainWound } from '../../../engine/game'
import { shuffle } from '../../../engine/random'

registerCardAbility('mastermind-carnage-master-strike', async (state, { ui }) => {
  const feasted = await feastTopCard(state, ui, 'Carnage')
  if (feasted && state.cards[feasted.cardId].hero && (state.cards[feasted.cardId].cost ?? 0) === 0) {
    await gainWound(state, ui)
  }
})

registerCardAbility('mastermind-mysterio-master-strike', async (state, { self }) => {
  // The drawn Master Strike becomes a real 6 VP Tactic, so claimTactic can
  // score and resolve it exactly like the other face-down Tactics.
  self.cardId = 'mysterio-master-strike-tactic'
  state.mysterioTacticIds = [...(state.mysterioTacticIds ?? []), self.instanceId]
  state.tactics = shuffle([...state.tactics, self])
})

registerCardAbility('mastermind-supreme-intelligence-of-the-kree-master-strike', async (state, { ui }) => {
  placeShardsOn(state, state.mastermind, 1)
  const shardCount = shardsOn(state, state.mastermind)
  const hand = [...state.hand]
  if (hand.length > 0) await ui.showCards(hand, 'Supreme Intelligence Master Strike: revealed hand')

  for (const card of hand) {
    const cost = state.cards[card.cardId].cost
    if (cost === shardCount || cost === shardCount + 1) {
      await discardCard(state, card.instanceId, ui)
    }
  }
})

const isNonGreyHero = (state: GameState, card: CardInstance): boolean =>
  !!state.cards[card.cardId].hero && (state.cards[card.cardId].type?.length ?? 0) > 0

registerCardAbility('mastermind-thanos-master-strike', async (state, { ui }) => {
  const hand = [...state.hand]
  if (hand.length > 0) await ui.showCards(hand, 'Thanos Master Strike: revealed hand')
  const heroes = hand.filter((card) => isNonGreyHero(state, card))
  if (heroes.length === 0) return

  const chosen = await ui.choose(heroes, {
    prompt: 'Thanos Master Strike: choose a non-grey Hero to put into Bound Souls',
    optional: false,
  })
  if (!chosen) return

  state.hand = state.hand.filter((card) => card.instanceId !== chosen.instanceId)
  state.captives[state.mastermind.instanceId] = [
    ...(state.captives[state.mastermind.instanceId] ?? []),
    chosen,
  ]
  await ui.showCapture(state.mastermind, chosen, 'Thanos captured a Hero in Bound Souls')
})
