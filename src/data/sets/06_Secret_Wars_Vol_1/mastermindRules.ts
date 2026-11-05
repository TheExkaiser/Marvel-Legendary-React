import { registerMastermindRule } from '../../../engine/mastermindRules'
import { isExpensiveHero } from './tacticAbilities'
import { MADELYNE_PRYOR, NIMROD_SUPER_SENTINEL, WASTELAND_HULK, ZOMBIE_GREEN_GOBLIN } from './cards'

// Madelyne: jej jeńcy-Bystanderzy to Demon Goblins (2 Attack), zostają przy niej po walce, a dopóki jakiegoś ma, nie można z nią walczyć
registerMastermindRule(MADELYNE_PRYOR.card.id, {
  captiveVillainAttack: 2,
  captivesSurviveFight: true,
  canFight: (state, mastermind) =>
    !(state.captives[mastermind.instanceId] ?? []).some((card) => state.cards[card.cardId].kind === 'bystander'),
})

registerMastermindRule(NIMROD_SUPER_SENTINEL.card.id, {
  canFight: (state) => state.recruitGainedThisTurn >= 6,
})

const hulkTacticIds = new Set(WASTELAND_HULK.tactics.map((tactic) => tactic.id))

registerMastermindRule(WASTELAND_HULK.card.id, {
  villainStrengthModifier: (state, instance) => {
    if (instance.cardId !== WASTELAND_HULK.card.id) return 0
    return 3 * state.defeated.filter((card) => hulkTacticIds.has(card.cardId)).length
  },
})

registerMastermindRule(ZOMBIE_GREEN_GOBLIN.card.id, {
  villainStrengthModifier: (state, instance) => {
    if (instance.cardId !== ZOMBIE_GREEN_GOBLIN.card.id) return 0
    return state.ko.filter((card) => isExpensiveHero(state, card)).length
  },
})
