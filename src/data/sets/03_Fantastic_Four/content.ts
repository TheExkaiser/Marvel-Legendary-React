import type { CardGroup, MastermindData } from '../../../engine/types'
import { HUMAN_TORCH_CARDS, INVISIBLE_WOMAN_CARDS } from './cards'

export const FANTASTIC_FOUR_HEROES: CardGroup[] = [
  { id: 'fantasticfour_human_torch', name: 'Human Torch', cards: HUMAN_TORCH_CARDS },
  { id: 'fantasticfour_invisible_woman', name: 'Invisible Woman', cards: INVISIBLE_WOMAN_CARDS },
]

export const FANTASTIC_FOUR_VILLAIN_GROUPS: CardGroup[] = []

export const FANTASTIC_FOUR_HENCHMEN_GROUPS: CardGroup[] = []

export const FANTASTIC_FOUR_BYSTANDER_GROUPS: CardGroup[] = []

export const FANTASTIC_FOUR_MASTERMINDS: MastermindData[] = []
