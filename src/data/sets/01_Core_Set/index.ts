import type { SetData } from '../../../engine/types'
import { CORE_SCHEMES } from './schemes'
import './heroAbilities'
import './tacticAbilities'
import './masterStrikeAbilities'
import './replacementAbilities'
import './villainAbilities.ts'

export const CORE_SET: SetData = {
  id: 'core_set',
  name: 'Core Set',
  schemes: CORE_SCHEMES,
}