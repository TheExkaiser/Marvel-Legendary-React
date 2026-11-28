import type { CardInstance, GameState } from './types'
import type { UiAdapter } from './ui'
import { logEvent } from './common'
import { shuffle } from './random'

/** Zakryte Tactics Masterminda o danym cardId: główny trzyma je w state.tactics, pozostali w mastermindTactics. */
function tacticPile(state: GameState, mastermindCardId: string): CardInstance[] | undefined {
  const mastermind = (state.masterminds ?? [state.mastermind]).find((candidate) => candidate.cardId === mastermindCardId)
  if (!mastermind) return undefined
  return mastermind.instanceId === state.mastermind.instanceId
    ? state.tactics
    : state.mastermindTactics?.[mastermind.instanceId]
}

/** Wsuwa Tactic z powrotem między zakryte Tactics Masterminda i tasuje je.
 * Tablica jest zmieniana w miejscu, bo claimTactic trzyma do niej referencję i po niej poznaje, że Tactic wrócił
 * (nie trafia wtedy do Victory Pile, a Mastermind nie jest pokonany). */
export function returnTacticToPile(state: GameState, mastermindCardId: string, tactic: CardInstance): void {
  const pile = tacticPile(state, mastermindCardId)
  if (!pile) return
  if (pile.some((card) => card.instanceId === tactic.instanceId)) return
  pile.push(tactic)
  pile.splice(0, pile.length, ...shuffle([...pile]))
}

/** Fateful Resurrection na Tacticu: odkryj wierzch talii Villainów; Scheme Twist lub Master Strike = Tactic wraca (potasowany) między
 * zakryte Tactics. Efekty Fight Tactica i tak się rozpatrują. Zwraca true, jeśli Tactic zmartwychwstał. */
export async function fatefulResurrectionTactic(
  state: GameState,
  ui: UiAdapter,
  tactic: CardInstance,
  mastermindCardId: string,
): Promise<boolean> {
  const top = state.villainDeck[state.villainDeck.length - 1]
  if (!top) return false
  await ui.showInfo(top, 'Fateful Resurrection: revealed the top card of the Villain Deck')
  const kind = state.cards[top.cardId].kind
  if (kind !== 'twist' && kind !== 'masterstrike') return false
  returnTacticToPile(state, mastermindCardId, tactic)
  logEvent(state, `Fateful Resurrection: ${state.cards[tactic.cardId].name} shuffled back into the Tactics`)
  return true
}
