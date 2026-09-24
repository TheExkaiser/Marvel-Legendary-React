import type { SetData } from '../../../engine/types'
import { CORE_SCHEMES } from './schemes'
import {
  CORE_HEROES,
  CORE_VILLAIN_GROUPS,
  CORE_HENCHMEN_GROUPS,
  CORE_MASTERMINDS,
  CORE_SHARED,
} from './content'
import './heroAbilities'
import './tacticAbilities'
import './masterStrikeAbilities'
import './replacementAbilities'
import './villainAbilities.ts'

export const CORE_SET: SetData = {
  id: 'core_set',
  name: 'Core Set',
  schemes: CORE_SCHEMES,
  heroes: CORE_HEROES,
  villainGroups: CORE_VILLAIN_GROUPS,
  henchmenGroups: CORE_HENCHMEN_GROUPS,
  masterminds: CORE_MASTERMINDS,
  shared: CORE_SHARED,
}
