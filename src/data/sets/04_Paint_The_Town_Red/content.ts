import type { CardGroup, MastermindData } from '../../../engine/types'
import {
  BLACK_CAT_CARDS,
  MOON_KNIGHT_CARDS,
  SCARLET_SPIDER_CARDS,
  SPIDER_WOMAN_CARDS,
  SYMBIOTE_SPIDER_MAN_CARDS,
} from './cards'

// TODO(Paint the Town Red): add hero and enemy card groups.
export const PAINT_THE_TOWN_RED_HEROES: CardGroup[] = [
  { id: 'paint_red_black_cat', name: 'Black Cat', realName: 'Felicia Hardy', cards: BLACK_CAT_CARDS },
  { id: 'paint_red_moon_knight', name: 'Moon Knight', realName: 'Marc Spector', cards: MOON_KNIGHT_CARDS },
  { id: 'paint_red_scarlet_spider', name: 'Scarlet Spider', realName: 'Ben Reilly', cards: SCARLET_SPIDER_CARDS },
  { id: 'paint_red_spider_woman', name: 'Spider-Woman', realName: 'Jessica Drew', cards: SPIDER_WOMAN_CARDS },
  { id: 'paint_red_symbiote_spider_man', name: 'Symbiote Spider-Man', realName: 'Peter Parker', cards: SYMBIOTE_SPIDER_MAN_CARDS },
]
export const PAINT_THE_TOWN_RED_VILLAIN_GROUPS: CardGroup[] = []
export const PAINT_THE_TOWN_RED_HENCHMEN_GROUPS: CardGroup[] = []
export const PAINT_THE_TOWN_RED_BYSTANDER_GROUPS: CardGroup[] = []
export const PAINT_THE_TOWN_RED_MASTERMINDS: MastermindData[] = []
