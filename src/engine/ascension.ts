import type { CardInstance, GameState } from './types'
import { logEvent } from './common'

export function ascendVillainToMastermind(
  state: GameState,
  villain: CardInstance,
  masterStrikeId: string,
  masterStrikeText: string,
): void {
  const data = state.cards[villain.cardId]
  const cardId = `ascended-${villain.instanceId}`
  const mastermind = { instanceId: villain.instanceId, cardId }

  state.cards[cardId] = {
    ...data,
    id: cardId,
    strength: data.strength ?? 0,
    text: `Master Strike: ${masterStrikeText}`,
    villainGroup: undefined,
    henchman: undefined,
    keywords: [],
  }
  state.escaped = state.escaped.filter((card) => card.instanceId !== villain.instanceId)
  state.masterminds = [...(state.masterminds ?? [state.mastermind]), mastermind]
  state.mastermindStrikeIds = {
    ...state.mastermindStrikeIds,
    [mastermind.instanceId]: masterStrikeId,
  }
  state.singleFightMasterminds = [...(state.singleFightMasterminds ?? []), mastermind.instanceId]
  logEvent(state, `${data.name} ascended to become a Mastermind`)
}
