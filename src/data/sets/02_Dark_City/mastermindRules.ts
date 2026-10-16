import { registerMastermindRule } from '../../../engine/mastermindRules'
import type { GameState } from '../../../engine/types'

// unikalne nazwy kart głównej grupy złoczyńców (state.cards zawiera tylko karty użyte w tej grze)
function ledGroupNames(state: GameState): string[] {
  const group = state.ledVillainGroup
  if (group === undefined) return []
  return [...new Set(Object.values(state.cards).filter((c) => c.villainGroup === group).map((c) => c.name))]
}

registerMastermindRule('mastermind-apocalypse', {
  villainStrengthModifier: (state, instance) => {
    const group = state.ledVillainGroup
    const bonus = group !== undefined && state.cards[instance.cardId].villainGroup === group ? 2 : 0
    console.log('apocalypse mod:', state.cards[instance.cardId].name, group, bonus)
    return bonus
  },
  checkLoss: (state) => {
    const names = ledGroupNames(state)
    return (
      names.length > 0 &&
      names.every((name) => state.escaped.some((c) => state.cards[c.cardId].name === name))
    )
  },
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