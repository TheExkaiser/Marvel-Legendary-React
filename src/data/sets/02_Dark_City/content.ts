import type { CardGroup } from '../../../engine/types'
import { ANGEL_CARDS, BISHOP_CARDS, BLADE_CARDS, CABLE_CARDS, COLOSSUS_CARDS, DAREDEVIL_CARDS, DOMINO_CARDS, ELEKTRA_CARDS, FORGE_CARDS, GHOST_RIDER_CARDS, ICEMAN_CARDS, IRON_FIST_CARDS, JEAN_GREY_CARDS, NIGHTCRAWLER_CARDS, PROFESSOR_X_CARDS, PUNISHER_CARDS, WOLVERINE_CARDS,  MAGGIA_GOONS_CARDS, PHALANX_CARDS} from './cards'
import type { MastermindData } from '../../../engine/types'
import { NEWS_REPORTER_CARDS, PARAMEDIC_CARDS, RADIATION_SCIENTIST_CARDS } from './cards'
import { APOCALYPSE, KINGPIN, MEPHISTO, MR_SINISTER, STRYFE, FOUR_HORSEMEN_CARDS, MLF_CARDS, MARAUDERS_CARDS, EMISSARIES_OF_EVIL_CARDS, UNDERWORLD_CARDS, STREETS_OF_NEW_YORK_CARDS} from './cards'


export const DARK_CITY_HEROES: CardGroup[] = [
  { id: 'darkcity_angel', name: 'Angel', realName: 'Warren Worthington III', cards: ANGEL_CARDS },
  { id: 'darkcity_bishop', name: 'Bishop', realName: 'Lucas Bishop', cards: BISHOP_CARDS },
  { id: 'darkcity_blade', name: 'Blade', realName: 'Eric Brooks', cards: BLADE_CARDS },
  { id: 'darkcity_cable', name: 'Cable', realName: 'Nathan Summers', cards: CABLE_CARDS },
  { id: 'darkcity_colossus', name: 'Colossus', realName: 'Piotr Rasputin', cards: COLOSSUS_CARDS },
  { id: 'darkcity_daredevil', name: 'Daredevil', realName: 'Matt Murdock', cards: DAREDEVIL_CARDS },
  { id: 'darkcity_domino', name: 'Domino', realName: 'Neena Thurman', cards: DOMINO_CARDS },
  { id: 'darkcity_elektra', name: 'Elektra', realName: 'Elektra Natchios', cards: ELEKTRA_CARDS },
  { id: 'darkcity_forge', name: 'Forge', realName: 'Forge', cards: FORGE_CARDS },
  { id: 'darkcity_ghost_rider', name: 'Ghost Rider', realName: 'Johnny Blaze', cards: GHOST_RIDER_CARDS },
  { id: 'darkcity_iceman', name: 'Iceman', realName: 'Bobby Drake', cards: ICEMAN_CARDS },
  { id: 'darkcity_iron_fist', name: 'Iron Fist', realName: 'Danny Rand', cards: IRON_FIST_CARDS },
  { id: 'darkcity_jean_grey', name: 'Jean Grey', realName: 'Jean Grey', cards: JEAN_GREY_CARDS },
  { id: 'darkcity_nightcrawler', name: 'Nightcrawler', realName: 'Kurt Wagner', cards: NIGHTCRAWLER_CARDS },
  { id: 'darkcity_professor_x', name: 'Professor X', realName: 'Charles Xavier', cards: PROFESSOR_X_CARDS },
  { id: 'darkcity_punisher', name: 'Punisher', realName: 'Frank Castle', cards: PUNISHER_CARDS },
  { id: 'darkcity_wolverine', name: 'Wolverine', realName: 'James Howlett', cards: WOLVERINE_CARDS },
]

export const DARK_CITY_MASTERMINDS: MastermindData[] = [APOCALYPSE, KINGPIN, MEPHISTO, MR_SINISTER, STRYFE]

export const DARK_CITY_VILLAIN_GROUPS: CardGroup[] = [
  { id: 'darkcity_emissaries_of_evil', name: 'Emissaries of Evil', cards: EMISSARIES_OF_EVIL_CARDS },
  { id: 'darkcity_four_horsemen', name: 'Four Horsemen', cards: FOUR_HORSEMEN_CARDS },
  { id: 'darkcity_marauders', name: 'Marauders', cards: MARAUDERS_CARDS },
  { id: 'darkcity_mlf', name: 'MLF', cards: MLF_CARDS },
  { id: 'darkcity_streets_of_new_york', name: 'Streets of New York', cards: STREETS_OF_NEW_YORK_CARDS },
  { id: 'darkcity_underworld', name: 'Underworld', cards: UNDERWORLD_CARDS },
]

export const DARK_CITY_HENCHMEN_GROUPS: CardGroup[] = [
  { id: 'darkcity_maggia_goons', name: 'Maggia Goons', cards: MAGGIA_GOONS_CARDS },
  { id: 'darkcity_phalanx', name: 'Phalanx', cards: PHALANX_CARDS },
]

export const DARK_CITY_BYSTANDER_GROUPS: CardGroup[] = [
  {
    id: 'darkcity_bystanders',
    name: 'Dark City Bystanders',
    cards: [...NEWS_REPORTER_CARDS, ...PARAMEDIC_CARDS, ...RADIATION_SCIENTIST_CARDS],
  },
]
