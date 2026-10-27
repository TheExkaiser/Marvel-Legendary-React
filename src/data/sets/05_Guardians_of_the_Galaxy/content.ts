import type { CardGroup, MastermindData } from '../../../engine/types'
import { DRAX_THE_DESTROYER_CARDS, GAMORA_CARDS, GROOT_CARDS, ROCKET_RACCOON_CARDS, STAR_LORD_CARDS } from './cards'

export const GUARDIANS_OF_THE_GALAXY_HEROES: CardGroup[] = [
  { id: 'gotg_drax_the_destroyer', name: 'Drax the Destroyer', cards: DRAX_THE_DESTROYER_CARDS },
  { id: 'gotg_gamora', name: 'Gamora', cards: GAMORA_CARDS },
  { id: 'gotg_groot', name: 'Groot', cards: GROOT_CARDS },
  { id: 'gotg_rocket_raccoon', name: 'Rocket Raccoon', cards: ROCKET_RACCOON_CARDS },
  { id: 'gotg_star_lord', name: 'Star-Lord', cards: STAR_LORD_CARDS },
]
export const GUARDIANS_OF_THE_GALAXY_VILLAIN_GROUPS: CardGroup[] = []
export const GUARDIANS_OF_THE_GALAXY_HENCHMEN_GROUPS: CardGroup[] = []
export const GUARDIANS_OF_THE_GALAXY_BYSTANDER_GROUPS: CardGroup[] = []
export const GUARDIANS_OF_THE_GALAXY_MASTERMINDS: MastermindData[] = []
