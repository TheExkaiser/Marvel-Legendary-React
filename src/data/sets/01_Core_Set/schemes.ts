import type { SchemeDef } from '../../../engine/types'
import { gainWound } from '../../../engine/game'

// TESTOWY scheme, wymyślony tylko po to, żeby ćwiczyć wszystkie mechanizmy.
// TODO: zastąpić prawdziwymi schematami Core Setu
const TEST_SCHEME: SchemeDef = {
  id: 'coreset_test_scheme',
  name: 'Test: Mroczne Portale',
  img: '',
  twistCount: 8,

  // Przygotowanie: licznik i portal na trzecim polu miasta (Rooftops)
  setup: (state) => {
    state.counters.darkness = 0
  },

  // Każdy Twist: +1 ciemności i rana, a trzeci dodaje portal na Sewers
  onTwist: (state, n) => {
    state.counters.darkness += 1
    //gainWound(state)
    if (state.counters.darkness >= 2 || state.counters.darkness <=7) console.log('wound')//gainWound(state)
  },

  // Każda ucieczka złoczyńcy: +1 ciemności
  onVillainEscaped: (state) => {},

  // Przegrywasz przy 4 ciemności (oprócz zwykłego limitu ucieczek)
  checkLoss: (state) => state.counters.darkness >= 8,
}

// Wszystkie schematy tego zestawu. Nowy scheme = nowy obiekt wyżej + wpis tutaj
export const CORE_SCHEMES: SchemeDef[] = [TEST_SCHEME]