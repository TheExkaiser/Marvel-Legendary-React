import type { CardGroup, MastermindData } from '../../../engine/types'
import { AGENT_VENOM_CARDS, ARKON_THE_MAGNIFICENT_CARDS, BEAST_CARDS } from './cards'

export const SECRET_WARS_VOL_2_HEROES: CardGroup[] = [
  { id: 'secret-wars-2-agent-venom', name: 'Agent Venom', realName: 'Flash Thompson', cards: AGENT_VENOM_CARDS },
  { id: 'secret-wars-2-arkon-the-magnificent', name: 'Arkon the Magnificent', cards: ARKON_THE_MAGNIFICENT_CARDS },
  { id: 'secret-wars-2-beast', name: 'Beast', cards: BEAST_CARDS },
]

export const SECRET_WARS_VOL_2_VILLAIN_GROUPS: CardGroup[] = []
export const SECRET_WARS_VOL_2_HENCHMEN_GROUPS: CardGroup[] = []
export const SECRET_WARS_VOL_2_BYSTANDER_GROUPS: CardGroup[] = []
export const SECRET_WARS_VOL_2_MASTERMINDS: MastermindData[] = []
