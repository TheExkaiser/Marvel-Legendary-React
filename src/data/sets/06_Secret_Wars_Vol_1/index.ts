import type { SetData } from '../../../engine/types'
import {
  SECRET_WARS_VOL_1_HEROES,
  SECRET_WARS_VOL_1_MASTERMINDS,
  SECRET_WARS_VOL_1_VILLAIN_GROUPS,
  SECRET_WARS_VOL_1_HENCHMEN_GROUPS,
  SECRET_WARS_VOL_1_BYSTANDER_GROUPS,
  SIDEKICK_CARD,
} from './content'
import './heroAbilities'
import { SECRET_WARS_VOL_1_SCHEMES } from './schemes'

export const SECRET_WARS_VOL_1_SET: SetData = {
  id: 'secret_wars_vol_1',
  name: 'Secret Wars Vol. 1',
  schemes: SECRET_WARS_VOL_1_SCHEMES,
  heroes: SECRET_WARS_VOL_1_HEROES,
  villainGroups: SECRET_WARS_VOL_1_VILLAIN_GROUPS,
  henchmenGroups: SECRET_WARS_VOL_1_HENCHMEN_GROUPS,
  masterminds: SECRET_WARS_VOL_1_MASTERMINDS,
  bystanderGroups: SECRET_WARS_VOL_1_BYSTANDER_GROUPS,
  sidekickCards: SIDEKICK_CARD,
}
