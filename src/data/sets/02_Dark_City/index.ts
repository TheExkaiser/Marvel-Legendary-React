import type { SetData } from '../../../engine/types'
import { DARK_CITY_HEROES, DARK_CITY_MASTERMINDS, DARK_CITY_VILLAIN_GROUPS, DARK_CITY_HENCHMEN_GROUPS } from './content'
import './heroAbilities'
import './masterStrikeAbilities'
import './tacticAbilities'
import './villainAbilities'
import './mastermindRules'
import { DARK_CITY_SCHEMES } from './schemes'

export const DARK_CITY_SET: SetData = {
  id: 'dark_city',
  name: 'Dark City',
  schemes: DARK_CITY_SCHEMES,
  heroes: DARK_CITY_HEROES,
  villainGroups: DARK_CITY_VILLAIN_GROUPS,
  henchmenGroups: DARK_CITY_HENCHMEN_GROUPS,
  masterminds: DARK_CITY_MASTERMINDS,
}