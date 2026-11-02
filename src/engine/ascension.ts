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
  state.ascendedFromCardIds = { ...state.ascendedFromCardIds, [villain.instanceId]: villain.cardId }
  logEvent(state, `${data.name} ascended to become a Mastermind`)
}

/** Karta Villaina, z której powstał ten Mastermind (np. Zombie Thanos), albo undefined, jeśli instancja nigdy się nie wzniosła. */
export function ascendedOriginalCardId(state: GameState, instance: CardInstance): string | undefined {
  return state.ascendedFromCardIds?.[instance.instanceId]
}

/** Cofa wzniesienie: zdejmuje Mastermina z gry i zwraca Villaina z jego pierwotną kartą (do ponownego wejścia do miasta). */
export function revertAscension(state: GameState, mastermind: CardInstance): CardInstance {
  const originalCardId = ascendedOriginalCardId(state, mastermind)
  if (!originalCardId) throw new Error(`Instancja ${mastermind.instanceId} nie wzniosła się na Mastermina`)

  const id = mastermind.instanceId
  const withoutId = <T>(record: Record<string, T> | undefined): Record<string, T> =>
    Object.fromEntries(Object.entries(record ?? {}).filter(([key]) => key !== id))

  state.masterminds = (state.masterminds ?? []).filter((card) => card.instanceId !== id)
  state.defeatedMastermindIds = (state.defeatedMastermindIds ?? []).filter((entry) => entry !== id)
  state.singleFightMasterminds = (state.singleFightMasterminds ?? []).filter((entry) => entry !== id)
  state.mastermindStrikeIds = withoutId(state.mastermindStrikeIds)
  state.ascendedFromCardIds = withoutId(state.ascendedFromCardIds)
  return { instanceId: id, cardId: originalCardId }
}
