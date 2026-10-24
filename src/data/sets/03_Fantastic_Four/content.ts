import type { CardGroup, MastermindData } from '../../../engine/types'
import {
  HUMAN_TORCH_CARDS,
  INVISIBLE_WOMAN_CARDS,
  MR_FANTASTIC_CARDS,
  SILVER_SURFER_CARDS,
  THING_CARDS,
  GALACTUS,
  MOLE_MAN,
  HERALDS_OF_GALACTUS_CARDS,
  SUBTERRANEA_CARDS,
} from './cards'

export const FANTASTIC_FOUR_HEROES: CardGroup[] = [
  { id: 'fantasticfour_human_torch', name: 'Human Torch', cards: HUMAN_TORCH_CARDS },
  { id: 'fantasticfour_invisible_woman', name: 'Invisible Woman', cards: INVISIBLE_WOMAN_CARDS },
  { id: 'fantasticfour_mr_fantastic', name: 'Mr. Fantastic', cards: MR_FANTASTIC_CARDS },
  { id: 'fantasticfour_silver_surfer', name: 'Silver Surfer', cards: SILVER_SURFER_CARDS },
  { id: 'fantasticfour_thing', name: 'Thing', cards: THING_CARDS },
]

export const FANTASTIC_FOUR_VILLAIN_GROUPS: CardGroup[] = [
  { id: 'fantasticfour_heralds_of_galactus', name: 'Heralds of Galactus', cards: HERALDS_OF_GALACTUS_CARDS },
  { id: 'fantasticfour_subterranea', name: 'Subterranea', cards: SUBTERRANEA_CARDS },
]

export const FANTASTIC_FOUR_HENCHMEN_GROUPS: CardGroup[] = []

export const FANTASTIC_FOUR_BYSTANDER_GROUPS: CardGroup[] = []

export const FANTASTIC_FOUR_MASTERMINDS: MastermindData[] = [GALACTUS, MOLE_MAN]
