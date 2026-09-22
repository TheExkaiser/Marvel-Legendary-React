import type { GameSetup } from '../../engine/types'
import {
  STARTING_CARDS,
  BLACK_WIDOW_CARDS,
  TEST_VILLAINS,
  DRDOOM,
  WOUND,
  BYSTANDER,
  SCHEME_TWIST,
} from './01_Core_Set/cards'
import { findScheme } from './index'

export const TEST_SETUP: GameSetup = {
  startingCards: STARTING_CARDS,
  heroCards: BLACK_WIDOW_CARDS,
  villainCards: TEST_VILLAINS,
  mastermind: DRDOOM,
  wounds: { card: WOUND, count: 30 },
  bystanders: { card: BYSTANDER, count: 30 },
  bystandersInVillainDeck: 1,
  scheme: findScheme('coreset_test_scheme'),
  twist: SCHEME_TWIST,
}