import type { SchemeDef } from '../../../engine/types'
import { gainWound } from '../../../engine/game'
import { revealCards } from '../../../engine/keywords'
import { CITY_NAMES } from '../../../engine/constants'
import { resolveVillainDeckCard, checkEndConditions } from '../../../engine/villainPhase'

const COSMIC_CUBE: SchemeDef = {
  id: 'coreset_cosmic_cube',
  name: 'Unleash the Power of the Cosmic Cube',
  img: '',
  twistCount: 8,
  text:
    'Setup: 8 Twists.\n' +
    'Twist: Put the Twist next to this Scheme.\n' +
    'Twist 5-6: Each player gains a Wound.\n' +
    'Twist 7: Each player gains 3 Wounds.\n' +
    'Twist 8: Evil Wins!',

  onTwist: async (state, n, ui) => {
    if (n >= 2 && n <= 6) {
      await gainWound(state, ui)
    } else if (n === 7) {
      for (let i = 0; i < 3; i++) {
        await gainWound(state, ui)
      }
    }
  },

  checkLoss: (state) => state.twistsRevealed >= 8,
}

const LEGACY_VIRUS: SchemeDef = {
  id: 'coreset_legacy_virus',
  name: 'The Legacy Virus',
  img: '',
  twistCount: 8,
  text:
    'Setup: 8 Twists. Wound stack holds 6 Wounds per player.\n' +
    'Twist: Each player reveals a Tech Hero or gains a Wound.\n' +
    'Evil Wins: If the Wound stack runs out.',

  setup: (state) => {
    state.wounds = state.wounds.slice(0, 6)
  },

  onTwist: async (state, n, ui) => {
    const techToReveal = revealCards(state, { type: 'tech' })

    if (techToReveal.length > 0) {
      const chosen =
        techToReveal.length === 1
          ? techToReveal[0]
          : await ui.choose(techToReveal, {
              prompt: 'The Legacy Virus (Twist): reveal a Tech Hero or gain a Wound',
              optional: false,
            })
      if (chosen) {
        await ui.showInfo(chosen, 'The Legacy Virus (Twist): revealed a Tech Hero')
        return
      }
    }

    await gainWound(state, ui)
  },

  checkLoss: (state) => state.wounds.length === 0,
}

const MIDTOWN_BANK_ROBBERY: SchemeDef = {
  id: 'coreset_midtown_bank_robbery',
  name: 'Midtown Bank Robbery',
  img: '',
  twistCount: 8,
  text:
    'Setup: 8 Twists. 12 total Bystanders in the Villain Deck.\n' +
    'Special Rules: Each Villain gets +1 Attack for each Bystander it has.\n' +
    'Twist: Any Villain in the Bank captures 2 Bystanders. Then play the top card of the Villain Deck.\n' +
    'Evil Wins: When 8 Bystanders are carried away by escaping Villains.',

  setupRules: {
    bystandersInVillainDeck: 12,
  },

  villainStrengthModifier: (state, instance) => {
    return state.captives[instance.instanceId]?.length ?? 0
  },

  onTwist: async (state, n, ui) => {
    const bankIndex = CITY_NAMES.indexOf('Bank')
    const villain = state.city[bankIndex]
    if (villain) {
      for (let i = 0; i < 2 && state.bystanders.length > 0; i++) {
        const bystander = state.bystanders.pop()!
        const list = state.captives[villain.instanceId] ?? []
        list.push(bystander)
        state.captives[villain.instanceId] = list
      }
    }

    const card = state.villainDeck.pop()
    if (card) {
      await resolveVillainDeckCard(state, card, ui)
      checkEndConditions(state)
    }
  },

  onVillainEscaped: (state, villain, lostCaptives) => {
    const bystanderCount = lostCaptives.filter((c) => state.cards[c.cardId].kind === 'bystander').length
    state.counters['bystandersCarriedAway'] = (state.counters['bystandersCarriedAway'] ?? 0) + bystanderCount
  },

  checkLoss: (state) => (state.counters['bystandersCarriedAway'] ?? 0) >= 8,
}

const NEGATIVE_ZONE_PRISON_BREAKOUT: SchemeDef = {
  id: 'coreset_negative_zone_prison_breakout',
  name: 'Negative Zone Prison Breakout',
  img: '',
  twistCount: 8,
  text:
    'Setup: 8 Twists. Add an extra Henchman group to the Villain Deck.\n' +
    'Twist: Play the top 2 cards of the Villain Deck.\n' +
    'Evil Wins: If 12 Villains escape.',

  setupRules: {
    henchmenGroups: 2,
  },

  onTwist: async (state, n, ui) => {
    for (let i = 0; i < 2; i++) {
      const card = state.villainDeck.pop()
      if (!card) break
      await resolveVillainDeckCard(state, card, ui)
    }
    checkEndConditions(state)
  },

  escapeLimit: 12,
}

const PORTALS_TO_THE_DARK_DIMENSION: SchemeDef = {
  id: 'coreset_portals_to_the_dark_dimension',
  name: 'Portals to the Dark Dimension',
  img: '',
  twistCount: 7,
  text:
    'Setup: 7 Twists. Each Twist is a Dark Portal.\n' +
    'Twist 1: Put the Dark Portal above the Mastermind. The Mastermind gets +1 Attack.\n' +
    "Twists 2-6: Put the Dark Portal in the leftmost city space that doesn't yet have a Dark Portal. Villains in that city space get +1 Attack.\n" +
    'Twist 7: Evil Wins!',

  onTwist: async (state, n) => {
    if (n === 1) {
      state.counters['Dark Portal (Mastermind)'] = (state.counters['Dark Portal (Mastermind)'] ?? 0) + 1
      return
    }

    if (n >= 2 && n <= 6) {
      const index = CITY_NAMES.findIndex((_, i) => !state.cityMarkers[i].includes('Dark Portal'))
      if (index !== -1) {
        state.cityMarkers[index].push('Dark Portal')
      }
    }

    // Twist 7: Evil Wins — obsłużone przez checkLoss
  },

  checkLoss: (state) => state.twistsRevealed >= 7,
}

// Wszystkie schematy tego zestawu. Nowy scheme = nowy obiekt wyżej + wpis tutaj
export const CORE_SCHEMES: SchemeDef[] = [
  COSMIC_CUBE,
  LEGACY_VIRUS,
  MIDTOWN_BANK_ROBBERY,
  NEGATIVE_ZONE_PRISON_BREAKOUT,
  PORTALS_TO_THE_DARK_DIMENSION,
]