import { registerMastermindRule } from '../../../engine/mastermindRules'
import { revealCards, getEffectiveStrength } from '../../../engine/keywords'
import { HERO_CLASSES, heroClassLabel } from '../../../engine/heroClasses'
import { isLedGroupVillain } from '../../../engine/ledGroup'
import { isCityDestroyed } from '../../../engine/cityLayout'

const COSMIC_THREAT_REDUCTION = 3

// Galactus, Cosmic Threat (wszystkie 5 klas): raz na turę gracz wybiera klasę. Za każdą odkrytą kartę tej klasy
// (ręka + zagrane) Galactus ma -3 Attack w JEDNEJ walce. Wybór pada po kliknięciu w Galactusa, z podglądem
// wynikowej siły. Druga walka w tej samej turze: pełna siła, bez Cosmic Threat.
registerMastermindRule('mastermind-galactus', {
  villainStrengthModifier: (state, instance) =>
    instance.instanceId === state.mastermind.instanceId ? -(state.cosmicThreatReduction ?? 0) : 0,

  beforeFight: async (state, ui) => {
    if (state.cosmicThreatUsedThisTurn) return true

    const available = state.attack + (state.recruitCountsAsAttackThisTurn ? state.recruit : 0)
    const baseStrength = getEffectiveStrength(state, state.mastermind) ?? 0

    const options = HERO_CLASSES.map((type) => {
      const count = revealCards(state, { type }).length
      return { type, count, strength: Math.max(0, baseStrength - COSMIC_THREAT_REDUCTION * count) }
    })

    const affordable = options.filter((o) => o.strength <= available)
    if (affordable.length === 0) {
      const best = Math.min(...options.map((o) => o.strength))
      await ui.showInfo(
        state.mastermind,
        `Za mało Attack: masz ${available}, a najniższa możliwa siła Galactusa to ${best}`,
      )
      return false
    }

    const choice = await ui.chooseOptionWithCard(
      state.mastermind,
      [
        ...affordable.map((o) => ({
          id: o.type,
          label: `${heroClassLabel(o.type)}: ${o.count} → Attack ${o.strength}`,
          icon: `icons/${o.type}.png`,
        })),
        { id: 'cancel', label: 'Anuluj walkę' },
      ],
      'Cosmic Threat: wybierz klasę kart do odkrycia',
    )

    const picked = affordable.find((o) => o.type === choice)
    if (!picked) return false

    state.cosmicThreatReduction = COSMIC_THREAT_REDUCTION * picked.count
    state.cosmicThreatUsedThisTurn = true
    return true
  },

  // Galactus Wins: gdy całe miasto jest zniszczone
  checkLoss: (state) => state.city.every((_, i) => isCityDestroyed(state, i)),
})

// Mole Man: +1 Attack za każdego Villaina z głównej grupy (Subterranea), który uciekł
registerMastermindRule('mastermind-mole-man', {
  villainStrengthModifier: (state, instance) =>
    instance.instanceId === state.mastermind.instanceId
      ? state.escaped.filter((c) => isLedGroupVillain(state, c)).length
      : 0,
})
