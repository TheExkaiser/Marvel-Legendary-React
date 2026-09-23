import type { GameSetup } from '../../engine/types'
import {
  STARTING_CARDS,
  BLACK_WIDOW_CARDS,
  CAPTAIN_AMERICA_CARDS,
  CYCLOPS_CARDS,
  SHIELD_OFFICER,
  BROTHERHOOD_CARDS,
  DRDOOM,
  WOUND,
  BYSTANDER,
  SCHEME_TWIST,
  MASTER_STRIKE_CARD,
} from './01_Core_Set/cards'
import { findScheme } from './index'

export const TEST_SETUP: GameSetup = {
  startingCards: STARTING_CARDS,
  heroCards: [...BLACK_WIDOW_CARDS, ...CAPTAIN_AMERICA_CARDS, ...CYCLOPS_CARDS],
  officerCards: { card: SHIELD_OFFICER, count: 30 },
  villainCards: BROTHERHOOD_CARDS,
  mastermind: DRDOOM,
  wounds: { card: WOUND, count: 30 },
  bystanders: { card: BYSTANDER, count: 30 },
  bystandersInVillainDeck: 1,
  masterStrikeCard: MASTER_STRIKE_CARD,
  masterStrikeCount: 5,
  scheme: findScheme('coreset_cosmic_cube'),
  twist: SCHEME_TWIST,
}