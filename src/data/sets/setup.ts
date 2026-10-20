import type { SetupChoices } from '../../engine/types'
import { DRDOOM } from './01_Core_Set/cards'

// Preset debug: szybki start znanego zestawu (przycisk w menu, tylko w trybie dev)
export const DEBUG_PRESET: SetupChoices = {
  gameModeId: '', // puste: tryb wybierasz w menu (pruneChoices i tak czyści nieznane id)
  schemeId: 'coreset_cosmic_cube',
  mastermindId: DRDOOM.card.id,
  heroIds: ['coreset_black_widow', 'coreset_captain_america', 'coreset_cyclops'],
  villainDeckHeroIds: [],
  villainGroupIds: ['coreset_brotherhood'],
  henchmenGroupIds: ['coreset_doombot_legion'],
  bystanderGroupIds: ['darkcity_news_reporter', 'darkcity_paramedic', 'darkcity_radiation_scientist'],
}