import { logEvent } from '../../../engine/common'
import { registerCircleOfKungFu } from '../../../engine/kungFu'
import { registerMastermindRule } from '../../../engine/mastermindRules'
import { registerStrengthModifier } from '../../../engine/strengthModifiers'
import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { gainWound } from '../../../engine/wounds'
import { IMMORTAL_EMPEROR_ZHENG_ZHU, KING_HYPERION, SPIDER_QUEEN } from './cards'

// 7th Circle of Kung-Fu: +7 Attack w Twojej turze, chyba że ujawnisz Bohatera kosztującego 7 lub więcej
registerCircleOfKungFu(IMMORTAL_EMPEROR_ZHENG_ZHU.card.id, 7)

// Spider-Queen: +1 Attack za każdego Bystandera w Escape Pile
registerStrengthModifier(SPIDER_QUEEN.card.id, (state) => state.escapedBystanders.length)

// King Hyperion: gdy stoi w mieście, nie walczy się z nim z pola Mastermina (walka w mieście zdobywa Tactic, patrz combat.ts)
registerMastermindRule(KING_HYPERION.card.id, {
  canFight: (state, mastermind) => !state.city.some((card) => card?.instanceId === mastermind.instanceId),
})

// Escape: każdy gracz zdobywa Wounda, a Hyperion wraca na pole Mastermina (zdejmujemy go z Escape Pile, bo nie jest uciekinierem)
registerVillainAbilities(KING_HYPERION.card.id, {
  onEscape: async (state, ui, self) => {
    const index = state.escaped.findIndex((card) => card.instanceId === self.instanceId)
    if (index !== -1) state.escaped.splice(index, 1)
    logEvent(state, 'King Hyperion escaped and returned to the Mastermind space')
    await gainWound(state, ui)
  },
})
