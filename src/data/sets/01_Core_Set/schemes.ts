import type { SchemeDef } from '../../../engine/types'
import { gainWound } from '../../../engine/game'

const COSMIC_CUBE: SchemeDef = {
  id: 'coreset_cosmic_cube',
  name: 'Unleash the Power of the Cosmic Cube',
  img: '',
  twistCount: 8,

  // Setup: 8 Twistów w talii złoczyńców (twistCount) - nic więcej nie trzeba

  // Twist 2-6: 1 rana, Twist 7: 3 rany, Twist 8: Evil Wins (patrz checkLoss)
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

// Wszystkie schematy tego zestawu. Nowy scheme = nowy obiekt wyżej + wpis tutaj
export const CORE_SCHEMES: SchemeDef[] = [COSMIC_CUBE]