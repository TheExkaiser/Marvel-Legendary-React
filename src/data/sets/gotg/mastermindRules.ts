import { registerMastermindRule } from '../../../engine/mastermindRules'

registerMastermindRule('mastermind-carnage', {
  villainStrengthModifier: (state, instance) =>
    2 * (state.captives[instance.instanceId] ?? []).filter((card) => !!state.cards[card.cardId].hero).length,
})
