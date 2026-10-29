import { registerMastermindRule } from '../../../engine/mastermindRules'

registerMastermindRule('mastermind-carnage', {
  villainStrengthModifier: (state, instance) =>
    2 * (state.captives[instance.instanceId] ?? []).filter((card) => !!state.cards[card.cardId].hero).length,
})

registerMastermindRule('mastermind-thanos', {
  villainStrengthModifier: (state, instance) => {
    if (instance.instanceId !== state.mastermind.instanceId) return 0
    return (
      -2 *
      (state.artifacts ?? []).filter((artifact) => {
        const data = state.cards[artifact.cardId]
        return data.villainGroup === 'Infinity Gems' && (data.keywords ?? []).includes('artifact')
      }).length
    )
  },
  captivesSurviveFight: true,
})
