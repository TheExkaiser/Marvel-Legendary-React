import { registerCardAbility } from '../../../engine/cardAbilities'
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
