import type { CardInstance, GameModeDef } from '../../engine/types'
import { resolveVillainDeckCard, checkEndConditions } from '../../engine/villainPhase'
import { refillHq } from '../../engine/recruit'

export const DARK_CITY_ADVANCED_SOLO: GameModeDef = {
  id: 'dark-city-advanced-solo',
  name: 'Dark City - Advanced Solo',
  setupRules: {
    henchmenCopiesPerGroup: 3,
  },

  // Master Strike: automatycznie odkryj i rozpatrz kolejną kartę z talii złoczyńców —
  // ale tylko RAZ na turę. Jeśli ta wymuszona karta sama okaże się Master Strike'iem,
  // jej własna logika się odpali, ale NIE wymusi kolejnego dobrania w tej samej turze.
  onMasterStrikeResolved: async (state, ui) => {
    if (state.masterStrikeAutoDrawUsedThisTurn) return
    state.masterStrikeAutoDrawUsedThisTurn = true

    const card = state.villainDeck.pop()
    if (!card) return
    await resolveVillainDeckCard(state, card, ui)
    checkEndConditions(state)
  },

  // Scheme Twist: wybierz bohatera (koszt <= 6) z HQ, na spód talii HQ, uzupełnij slot.
  onSchemeTwistResolved: async (state, ui) => {
    const candidates = state.hq.filter(
      (c): c is CardInstance => !!c && (state.cards[c.cardId].cost ?? 0) <= 6,
    )
    if (candidates.length === 0) return

    const chosen =
      candidates.length === 1
        ? candidates[0]
        : await ui.choose(candidates, {
            prompt: 'Dark City: choose a Hero (cost 6 or less) to bury at the bottom of the HQ deck',
            optional: true,
          })
    if (!chosen) return

    const index = state.hq.findIndex((c) => c?.instanceId === chosen.instanceId)
    state.hq[index] = null
    state.heroDeck.unshift(chosen) // spód talii HQ = początek tablicy (pop() bierze z końca = wierzch)
    refillHq(state)
  },
}