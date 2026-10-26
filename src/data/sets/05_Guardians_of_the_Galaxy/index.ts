import type { SetData } from '../../../engine/types'
import {
  PAINT_THE_TOWN_RED_HEROES,
  PAINT_THE_TOWN_RED_MASTERMINDS,
  PAINT_THE_TOWN_RED_VILLAIN_GROUPS,
  PAINT_THE_TOWN_RED_HENCHMEN_GROUPS,
  PAINT_THE_TOWN_RED_BYSTANDER_GROUPS,
} from './content'
import { PAINT_THE_TOWN_RED_SCHEMES } from './schemes'
import './heroAbilities'
import './villainAbilities'
import './masterStrikeAbilities'
import './tacticAbilities'
import './mastermindRules'

/* Wzór
export const GUARDIANS_OF_THE_GALAXY_RED_SET: SetData = {
  id: 'guardians_of_the_galaxy',
  name: 'Guardians of the Galaxy',
  schemes: PAINT_THE_TOWN_RED_SCHEMES, tutaj gotg
  heroes: PAINT_THE_TOWN_RED_HEROES, tutaj gotg
  villainGroups: PAINT_THE_TOWN_RED_VILLAIN_GROUPS, tutaj gotg
  henchmenGroups: PAINT_THE_TOWN_RED_HENCHMEN_GROUPS, tutaj gotg
  masterminds: PAINT_THE_TOWN_RED_MASTERMINDS, tutaj gotg
  bystanderGroups: PAINT_THE_TOWN_RED_BYSTANDER_GROUPS, tutaj gotg
}
*/