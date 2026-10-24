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

// Szkielet dodatku Paint the Town Red. Kolejne moduły zdolności można
// podłączać tutaj analogicznie do pozostałych setów.
export const PAINT_THE_TOWN_RED_SET: SetData = {
  id: 'paint_the_town_red',
  name: 'Paint the Town Red',
  schemes: PAINT_THE_TOWN_RED_SCHEMES,
  heroes: PAINT_THE_TOWN_RED_HEROES,
  villainGroups: PAINT_THE_TOWN_RED_VILLAIN_GROUPS,
  henchmenGroups: PAINT_THE_TOWN_RED_HENCHMEN_GROUPS,
  masterminds: PAINT_THE_TOWN_RED_MASTERMINDS,
  bystanderGroups: PAINT_THE_TOWN_RED_BYSTANDER_GROUPS,
}
