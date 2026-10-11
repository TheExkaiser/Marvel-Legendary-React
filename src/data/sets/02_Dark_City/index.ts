import type { SetData } from '../../../engine/types'
import { DARK_CITY_HEROES, DARK_CITY_MASTERMINDS, DARK_CITY_VILLAIN_GROUPS } from './content'
import './heroAbilities'
import './masterStrikeAbilities'
import './tacticAbilities'
import './villainAbilities'
import './mastermindRules'

export const DARK_CITY_SET: SetData = {
  id: 'dark_city',
  name: 'Dark City',
  schemes: [],
  heroes: DARK_CITY_HEROES,
  villainGroups: DARK_CITY_VILLAIN_GROUPS,
  henchmenGroups: [],
  masterminds: DARK_CITY_MASTERMINDS,
}