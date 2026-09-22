import type { SetData } from '../../../engine/types'
import { CORE_SCHEMES } from './schemes'
import './heroAbilities' // rejestruje umiejętności kart przy imporcie zestawu
import './tacticAbilities'

export const CORE_SET: SetData = {
  id: 'core_set',
  name: 'Core Set',
  schemes: CORE_SCHEMES,
}