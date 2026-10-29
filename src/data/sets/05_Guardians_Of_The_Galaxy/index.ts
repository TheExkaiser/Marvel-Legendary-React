import type { SetData } from '../../../engine/types'
import {
  GUARDIANS_OF_THE_GALAXY_HEROES,
  GUARDIANS_OF_THE_GALAXY_MASTERMINDS,
  GUARDIANS_OF_THE_GALAXY_VILLAIN_GROUPS,
  GUARDIANS_OF_THE_GALAXY_HENCHMEN_GROUPS,
  GUARDIANS_OF_THE_GALAXY_BYSTANDER_GROUPS,
} from './content'
import { GUARDIANS_OF_THE_GALAXY_SCHEMES } from './schemes'
import './heroAbilities'
import './villainAbilities'
import './mastermindRules'
import './masterStrikeAbilities'
import './tacticAbilities'

export const GUARDIANS_OF_THE_GALAXY_SET: SetData = {
  id: 'guardians_of_the_galaxy',
  name: 'Guardians of the Galaxy',
  schemes: GUARDIANS_OF_THE_GALAXY_SCHEMES,
  heroes: GUARDIANS_OF_THE_GALAXY_HEROES,
  villainGroups: GUARDIANS_OF_THE_GALAXY_VILLAIN_GROUPS,
  henchmenGroups: GUARDIANS_OF_THE_GALAXY_HENCHMEN_GROUPS,
  masterminds: GUARDIANS_OF_THE_GALAXY_MASTERMINDS,
  bystanderGroups: GUARDIANS_OF_THE_GALAXY_BYSTANDER_GROUPS,
}
