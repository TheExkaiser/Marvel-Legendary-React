import type { SetData } from '../../../engine/types'
import {
  FANTASTIC_FOUR_HEROES,
  FANTASTIC_FOUR_MASTERMINDS,
  FANTASTIC_FOUR_VILLAIN_GROUPS,
  FANTASTIC_FOUR_HENCHMEN_GROUPS,
  FANTASTIC_FOUR_BYSTANDER_GROUPS,
} from './content'
import './heroAbilities'
import './masterStrikeAbilities'
import './tacticAbilities'
import './villainAbilities'
import './mastermindRules'
import { FANTASTIC_FOUR_SCHEMES } from './schemes'

export const FANTASTIC_FOUR_SET: SetData = {
  id: 'fantastic_four',
  name: 'Fantastic Four',
  schemes: FANTASTIC_FOUR_SCHEMES,
  heroes: FANTASTIC_FOUR_HEROES,
  villainGroups: FANTASTIC_FOUR_VILLAIN_GROUPS,
  henchmenGroups: FANTASTIC_FOUR_HENCHMEN_GROUPS,
  masterminds: FANTASTIC_FOUR_MASTERMINDS,
  bystanderGroups: FANTASTIC_FOUR_BYSTANDER_GROUPS,
}
