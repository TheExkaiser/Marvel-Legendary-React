import type { SetupChoices } from '../../engine/types'
import { DRDOOM } from './01_Core_Set/cards'

// Preset debug: szybki start znanego zestawu (przycisk w menu, tylko w trybie dev)
export const DEBUG_PRESET: SetupChoices = {
  schemeId: 'coreset_cosmic_cube',
  mastermindId: DRDOOM.card.id,
  heroIds: ['coreset_black_widow', 'coreset_captain_america', 'coreset_cyclops'],
  villainGroupIds: ['coreset_brotherhood'],
  henchmenGroupIds: ['coreset_doombot_legion'],
}
