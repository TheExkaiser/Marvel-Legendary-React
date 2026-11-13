import type { SetData } from '../../../engine/types'
import {
  SECRET_WARS_VOL_2_HEROES,
  SECRET_WARS_VOL_2_MASTERMINDS,
  SECRET_WARS_VOL_2_VILLAIN_GROUPS,
  SECRET_WARS_VOL_2_HENCHMEN_GROUPS,
  SECRET_WARS_VOL_2_BYSTANDER_GROUPS,
} from './content'
import './heroAbilities'
import './villainAbilities'
import './mastermindRules'
import './masterStrikeAbilities'
import './tacticAbilities'
import { SECRET_WARS_VOL_2_SCHEMES } from './schemes'

export const SECRET_WARS_VOL_2_SET: SetData = {
  id: 'secret_wars_vol_2',
  name: 'Secret Wars Vol. 2',
  schemes: SECRET_WARS_VOL_2_SCHEMES,
  heroes: SECRET_WARS_VOL_2_HEROES,
  villainGroups: SECRET_WARS_VOL_2_VILLAIN_GROUPS,
  henchmenGroups: SECRET_WARS_VOL_2_HENCHMEN_GROUPS,
  masterminds: SECRET_WARS_VOL_2_MASTERMINDS,
  bystanderGroups: SECRET_WARS_VOL_2_BYSTANDER_GROUPS,
}
