import type { CardGroup, MastermindData, SharedCards } from '../../../engine/types'
import {
  STARTING_CARDS,
  BLACK_WIDOW_CARDS,
  CAPTAIN_AMERICA_CARDS,
  CYCLOPS_CARDS,
  DEADPOOL_CARDS,
  EMMA_FROST_CARDS,
  GAMBIT_CARDS,
  HAWKEYE_CARDS,
  HULK_CARDS,
  IRON_MAN_CARDS,
  NICK_FURY_CARDS,
  ROGUE_CARDS,
  SPIDER_MAN_CARDS,
  SHIELD_OFFICER,
  BROTHERHOOD_CARDS,
  ENEMIES_OF_ASGARD_CARDS,
  DOOMBOT_LEGION_CARDS,
  DRDOOM,
  LOKI,
  MAGNETO,
  RED_SKULL,
  WOUND,
  BYSTANDER,
  SCHEME_TWIST,
  MASTER_STRIKE_CARD,
} from './cards'

export const CORE_HEROES: CardGroup[] = [
  { id: 'coreset_black_widow', name: 'Black Widow', cards: BLACK_WIDOW_CARDS },
  { id: 'coreset_captain_america', name: 'Captain America', cards: CAPTAIN_AMERICA_CARDS },
  { id: 'coreset_cyclops', name: 'Cyclops', cards: CYCLOPS_CARDS },
  { id: 'coreset_deadpool', name: 'Deadpool', cards: DEADPOOL_CARDS },
  { id: 'coreset_emma_frost', name: 'Emma Frost', cards: EMMA_FROST_CARDS },
  { id: 'coreset_hawkeye', name: 'Hawkeye', cards: HAWKEYE_CARDS },
  { id: 'coreset_gambit', name: 'Gambit', cards: GAMBIT_CARDS},
  { id: 'coreset_hulk', name: 'Hulk', cards: HULK_CARDS },
  { id: 'coreset_iron_man', name: 'Iron Man', cards: IRON_MAN_CARDS },
  { id: 'coreset_nick_fury', name: 'Nick Fury', cards: NICK_FURY_CARDS },
  { id: 'coreset_rogue', name: 'Rogue', cards: ROGUE_CARDS },
  { id: 'coreset_spider_man', name: 'Spider-Man', cards: SPIDER_MAN_CARDS },
]

export const CORE_VILLAIN_GROUPS: CardGroup[] = [
  { id: 'coreset_brotherhood', name: 'Brotherhood', cards: BROTHERHOOD_CARDS },
  { id: 'coreset_enemies_of_asgard', name: 'Enemies of Asgard', cards: ENEMIES_OF_ASGARD_CARDS },
]

export const CORE_HENCHMEN_GROUPS: CardGroup[] = [
  { id: 'coreset_doombot_legion', name: 'Doombot Legion', cards: DOOMBOT_LEGION_CARDS },
]

export const CORE_MASTERMINDS: MastermindData[] = [DRDOOM, LOKI, MAGNETO, RED_SKULL]

export const CORE_SHARED: SharedCards = {
  startingCards: STARTING_CARDS,
  officer: { card: SHIELD_OFFICER, count: 30 },
  wounds: { card: WOUND, count: 30 },
  bystanders: { card: BYSTANDER, count: 30 },
  twist: SCHEME_TWIST,
  masterStrikeCard: MASTER_STRIKE_CARD,
  masterStrikeCount: 5,
}