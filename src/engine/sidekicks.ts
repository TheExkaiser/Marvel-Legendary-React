import type { GameState } from './types'
import { logEvent } from './common'

export function gainSidekicks(
  state: GameState,
  count: number,
  destination: 'discard' | 'deck-top' = 'discard',
): void {
  const gained = state.sidekickStack.splice(Math.max(0, state.sidekickStack.length - count))
  if (destination === 'deck-top') state.deck.push(...gained)
  else state.discard.push(...gained)
  if (gained.length > 0) {
    logEvent(state, `Gained ${gained.length} Sidekick${gained.length === 1 ? '' : 's'}`)
  }
}
