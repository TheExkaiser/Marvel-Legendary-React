import { registerMastermindRule } from '../../../engine/mastermindRules'

const HORSEMEN = ['Famine', 'Pestilence', 'War', 'Death'] // muszą pasować do `name` kart

registerMastermindRule('mastermind-apocalypse', {
  villainStrengthModifier: (state, instance) =>
    state.cards[instance.cardId].villainGroup === 'Four Horsemen' ? 2 : 0,
  checkLoss: (state) =>
    HORSEMEN.every((name) => state.escaped.some((c) => state.cards[c.cardId].name === name)),
})

registerMastermindRule('mastermind-mephisto', { woundsToDeckTop: true })

registerMastermindRule('mastermind-mr-sinister', {
  villainStrengthModifier: (state, instance) =>
    instance.instanceId === state.mastermind.instanceId
      ? (state.captives[instance.instanceId] ?? []).length
      : 0,
})

registerMastermindRule('mastermind-stryfe', {
  villainStrengthModifier: (state, instance) =>
    instance.instanceId === state.mastermind.instanceId
      ? (state.stackedMasterStrikes ?? []).length
      : 0,
})