import { registerMastermindRule } from '../../../engine/mastermindRules'
import type { GameState } from '../../../engine/types'
import { revealCards, getEffectiveStrength } from '../../../engine/keywords'
import { HERO_CLASSES, heroClassLabel } from '../../../engine/heroClasses'
import { isLedGroupVillain } from '../../../engine/ledGroup'
import { isCityDestroyed } from '../../../engine/cityLayout'

const COSMIC_THREAT_REDUCTION = 3

// Opcje Cosmic Threat: dla każdej klasy siła Galactusa po obniżce i informacja, czy gracza na nią stać.
// Wspólne dla beforeFight (wybór w oknie) i fightStrengthOptions (podświetlanie w UI), żeby oba mówiły to samo.
function cosmicThreatOptions(state: GameState) {
  const available = state.attack + (state.recruitCountsAsAttackThisTurn ? state.recruit : 0)
  const baseStrength = getEffectiveStrength(state, state.mastermind) ?? 0

  const options = HERO_CLASSES.map((type) => {
    const count = revealCards(state, { type }).length
    return { type, count, strength: Math.max(0, baseStrength - COSMIC_THREAT_REDUCTION * count) }
  })

  return { available, options, affordable: options.filter((o) => o.strength <= available) }
}

// Galactus, Cosmic Threat (wszystkie 5 klas): raz na turę gracz wybiera klasę. Za każdą odkrytą kartę tej klasy
// (ręka + zagrane) Galactus ma -3 Attack w JEDNEJ walce. Wybór pada po kliknięciu w Galactusa, z podglądem
// wynikowej siły. Druga walka w tej samej turze: pełna siła, bez Cosmic Threat.
registerMastermindRule('mastermind-galactus', {
  villainStrengthModifier: (state, instance) =>
    instance.instanceId === state.mastermind.instanceId ? -(state.cosmicThreatReduction ?? 0) : 0,

  beforeFight: async (state, ui) => {
    if (state.cosmicThreatUsedThisTurn) return true

    const { available, options, affordable } = cosmicThreatOptions(state)
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

  // Podświetlanie w UI: jeśli Cosmic Threat jest już zużyty, liczy się pełna siła, inaczej każda opcja, na którą nas stać
  fightStrengthOptions: (state) => {
    if (state.cosmicThreatUsedThisTurn) return [getEffectiveStrength(state, state.mastermind) ?? 0]
    return cosmicThreatOptions(state).affordable.map((o) => o.strength)
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
