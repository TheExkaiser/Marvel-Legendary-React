import type { SchemeDef } from '../../../engine/types'
import { gainWound } from '../../../engine/game'

const COSMIC_CUBE: SchemeDef = {
  id: 'coreset_cosmic_cube',
  name: 'Unleash the Power of the Cosmic Cube',
  img: '/cards/core-set/coreset_cosmic_cube.webp',
  twistCount: 8,
  text:
    'Setup: 8 Twists.\n' +
    'Twist: Put the Twist next to this Scheme.\n' +
    'Twist 5-6: Each player gains a Wound.\n' +
    'Twist 7: Each player gains 3 Wounds.\n' +
    'Twist 8: Evil Wins!',

  // Twist 5-6: 1 rana, Twist 7: 3 rany, Twist 8: Evil Wins (patrz checkLoss)
  onTwist: async (state, n, ui) => {
    if (n >= 5 && n <= 6) {
      await gainWound(state, ui)
    } else if (n === 7) {
      for (let i = 0; i < 3; i++) {
        await gainWound(state, ui)
      }
    }
  },

  checkLoss: (state) => state.twistsRevealed >= 8,
}

export const CORE_SCHEMES: SchemeDef[] = [COSMIC_CUBE]