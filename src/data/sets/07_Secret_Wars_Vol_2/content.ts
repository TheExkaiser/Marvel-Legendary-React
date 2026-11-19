import type { CardGroup, MastermindData } from '../../../engine/types'
import {
  AGENT_VENOM_CARDS,
  ARKON_THE_MAGNIFICENT_CARDS,
  BEAST_CARDS,
  BLACK_SWAN_CARDS,
  BYSTANDER_CARDS,
  CAPTAIN_BRITAIN_CARDS,
  CORVUS_GLAIVE_CARDS,
  DR_PUNISHER_SOLDIER_SUPREME_CARDS,
  ELSA_BLOODSTONE_CARDS,
  PHOENIX_FORCE_CYCLOPS_CARDS,
  RUBY_SUMMERS_CARDS,
  SHANG_CHI_CARDS,
  SILK_CARDS,
  SOULSWORD_COLOSSUS_CARDS,
  SPIDER_GWEN_CARDS,
  TIME_TRAVELING_JEAN_GREY_CARDS,
  THE_CAPTAIN_AND_THE_DEVIL_CARDS,
  IMMORTAL_EMPEROR_ZHENG_ZHU,
  KING_HYPERION,
  SHIKLAH_THE_DEMON_BRIDE,
  SPIDER_QUEEN,
} from './cards'

export const SECRET_WARS_VOL_2_HEROES: CardGroup[] = [
  { id: 'secret-wars-2-agent-venom', name: 'Agent Venom', realName: 'Flash Thompson', cards: AGENT_VENOM_CARDS },
  { id: 'secret-wars-2-arkon-the-magnificent', name: 'Arkon the Magnificent', cards: ARKON_THE_MAGNIFICENT_CARDS },
  { id: 'secret-wars-2-beast', name: 'Beast', cards: BEAST_CARDS },
  { id: 'secret-wars-2-black-swan', name: 'Black Swan', cards: BLACK_SWAN_CARDS },
  { id: 'secret-wars-2-the-captain-and-the-devil', name: 'The Captain and the Devil', cards: THE_CAPTAIN_AND_THE_DEVIL_CARDS },
  { id: 'secret-wars-2-captain-britain', name: 'Captain Britain', cards: CAPTAIN_BRITAIN_CARDS },
  { id: 'secret-wars-2-corvus-glaive', name: 'Corvus Glaive', cards: CORVUS_GLAIVE_CARDS },
  { id: 'secret-wars-2-dr-punisher-soldier-supreme', name: 'Dr. Punisher, Soldier Supreme', cards: DR_PUNISHER_SOLDIER_SUPREME_CARDS },
  { id: 'secret-wars-2-elsa-bloodstone', name: 'Elsa Bloodstone', cards: ELSA_BLOODSTONE_CARDS },
  { id: 'secret-wars-2-phoenix-force-cyclops', name: 'Phoenix Force Cyclops', cards: PHOENIX_FORCE_CYCLOPS_CARDS },
  { id: 'secret-wars-2-ruby-summers', name: 'Ruby Summers', cards: RUBY_SUMMERS_CARDS },
  { id: 'secret-wars-2-shang-chi', name: 'Shang-Chi', cards: SHANG_CHI_CARDS },
  { id: 'secret-wars-2-silk', name: 'Silk', cards: SILK_CARDS },
  { id: 'secret-wars-2-soulsword-colossus', name: 'Soulsword Colossus', cards: SOULSWORD_COLOSSUS_CARDS },
  { id: 'secret-wars-2-spider-gwen', name: 'Spider-Gwen', cards: SPIDER_GWEN_CARDS },
  { id: 'secret-wars-2-time-traveling-jean-grey', name: 'Time-Traveling Jean Grey', cards: TIME_TRAVELING_JEAN_GREY_CARDS },
]

export const SECRET_WARS_VOL_2_VILLAIN_GROUPS: CardGroup[] = []
export const SECRET_WARS_VOL_2_HENCHMEN_GROUPS: CardGroup[] = []
export const SECRET_WARS_VOL_2_BYSTANDER_GROUPS: CardGroup[] = [
  { id: 'secretwars2_bystanders', name: 'Secret Wars Vol. 2 Bystanders', cards: BYSTANDER_CARDS },
]
export const SECRET_WARS_VOL_2_MASTERMINDS: MastermindData[] = [
  IMMORTAL_EMPEROR_ZHENG_ZHU,
  KING_HYPERION,
  SHIKLAH_THE_DEMON_BRIDE,
  SPIDER_QUEEN,
]
