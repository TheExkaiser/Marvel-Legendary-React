import type { GameState } from './types'
import type { UiAdapter } from './ui'
import { ascendedOriginalCardId, revertAscension } from './ascension'
import { isVillainCard } from './keywords'
import { enterCity } from './villainPhase'

/** Rise of the Living Dead: Villain z wierzchu Victory Pile (z tym słowem kluczowym) wraca do miasta.
 * Karty Mastermind Tactics nie są Villainami, więc nigdy tak nie wracają. */
export async function riseOfTheLivingDead(state: GameState, ui: UiAdapter): Promise<void> {
  const top = state.defeated[state.defeated.length - 1]
  if (!top) return
  // Zombie, który wzniósł się na Mastermina i został pokonany jako Mastermind, też może powstać
  const ascendedFrom = ascendedOriginalCardId(state, top)
  const data = state.cards[ascendedFrom ?? top.cardId]
  if (!isVillainCard(data) || !(data.keywords ?? []).includes('rise-of-the-living-dead')) return
  state.defeated.pop()
  await enterCity(state, ascendedFrom ? revertAscension(state, top) : top, ui)
}
