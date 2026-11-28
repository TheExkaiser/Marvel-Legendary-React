import type { CardInstance, GameState } from './types'
import type { UiAdapter } from './ui'
import { logEvent } from './common'
import { enterCity } from './villainPhase'

/** Fateful Resurrection na Villainie: odkryj wierzch talii Villainów; Scheme Twist lub Master Strike = Villain wraca do miasta
 * (wchodzi na Sewers, odpalają się jego Ambush). Jeńców i inne efekty Fight rozpatrzono już przy pokonaniu.
 * Wywołuj z `onDefeated`, bo Villain musi już leżeć w Victory Pile. Zwraca true, jeśli zmartwychwstał.
 * Wzniesiony Mastermind nie leży w Victory Pile jako Villain, więc zostaje Mastermindem i nie wraca do miasta. */
export async function fatefulResurrectionVillain(
  state: GameState,
  ui: UiAdapter,
  villain: CardInstance,
): Promise<boolean> {
  const index = state.defeated.findIndex((card) => card.instanceId === villain.instanceId)
  if (index === -1) return false
  const top = state.villainDeck[state.villainDeck.length - 1]
  if (!top) return false
  await ui.showInfo(top, 'Fateful Resurrection: revealed the top card of the Villain Deck')
  const kind = state.cards[top.cardId].kind
  if (kind !== 'twist' && kind !== 'masterstrike') return false
  state.defeated.splice(index, 1)
  logEvent(state, `Fateful Resurrection: ${state.cards[villain.cardId].name} reenters the city`)
  await enterCity(state, villain, ui)
  return true
}
