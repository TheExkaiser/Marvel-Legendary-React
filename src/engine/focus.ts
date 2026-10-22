import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { assertPlaying } from './common'
import { getCardData } from './cardData'

export type FocusEffect = (state: GameState, ui: UiAdapter, self: CardInstance) => Promise<void>

const focusEffects = new Map<string, FocusEffect>()

/** Efekt po "Focus N Recruit ->" danej karty. Koszt N jest w danych karty (pole focus). */
export function registerFocusEffect(cardId: string, effect: FocusEffect): void {
  focusEffects.set(cardId, effect)
}

function focusUses(state: GameState, instance: CardInstance): number {
  return state.focusUsesThisTurn?.[instance.instanceId] ?? 0
}

/** Czy przycisk Focus ma być widoczny: karta ma Focus, gracza stać na koszt i nie wyczerpano limitu użyć (focusLimit). */
export function canFocus(state: GameState, instance: CardInstance): boolean {
  if (state.status !== 'playing') return false
  const data = getCardData(state, instance)
  if (data.focus === undefined || state.recruit < data.focus) return false
  if (data.focusLimit !== undefined && focusUses(state, instance) >= data.focusLimit) return false
  return true
}

/** Aktywuje Focus karty leżącej w played. Można wywoływać wielokrotnie, dopóki starcza Recruit. */
export async function activateFocus(
  state: GameState,
  instanceId: string,
  ui: UiAdapter,
): Promise<void> {
  assertPlaying(state)
  const instance = state.played.find((c) => c.instanceId === instanceId)
  if (!instance) throw new Error(`Karty ${instanceId} nie ma w zagranych`)
  if (!canFocus(state, instance)) throw new Error('Za mało Recruit na Focus')

  const effect = focusEffects.get(instance.cardId)
  if (!effect) throw new Error(`Brak efektu Focus dla karty ${instance.cardId}`)

  state.recruit -= getCardData(state, instance).focus!
  state.focusUsesThisTurn = {
    ...state.focusUsesThisTurn,
    [instance.instanceId]: focusUses(state, instance) + 1,
  }
  await effect(state, ui, instance)
}
