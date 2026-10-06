import type { CardGroup } from '../../../engine/types'
import { ANGEL_CARDS, BISHOP_CARDS, BLADE_CARDS, CABLE_CARDS } from './cards'

export const DARK_CITY_HEROES: CardGroup[] = [
  { id: 'darkcity_angel', name: 'Angel', cards: ANGEL_CARDS },
  { id: 'darkcity_bishop', name: 'Bishop', cards: BISHOP_CARDS },
  { id: 'darkcity_blade', name: 'Blade', cards: BLADE_CARDS },
  { id: 'darkcity_cable', name: 'Cable', cards: CABLE_CARDS },
]