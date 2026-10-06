import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'

export type MasterStrikeReaction = (
  state: GameState,
  ui: UiAdapter,
  self: CardInstance,
) => Promise<void>

const reactions = new Map<string, MasterStrikeReaction>()

/** Rejestruje reakcję karty z ręki na Master Strike ("przed jego efektem"). */
export function registerMasterStrikeReaction(cardId: string, reaction: MasterStrikeReaction): void {
  reactions.set(cardId, reaction)
}

/** Daje każdej karcie w ręce z zarejestrowaną reakcją szansę na reakcję, po kolei. */
export async function runMasterStrikeReactions(state: GameState, ui: UiAdapter): Promise<void> {
  // Kopia ręki, bo reakcje zmieniają state.hand
  for (const card of [...state.hand]) {
    const reaction = reactions.get(card.cardId)
    if (!reaction) continue
    if (!state.hand.some((c) => c.instanceId === card.instanceId)) continue // karta mogła już opuścić rękę
    await reaction(state, ui, card)
  }
}