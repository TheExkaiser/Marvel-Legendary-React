import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { assertPlaying } from './common'
import { getCardData } from './cardData'

export type FocusEffect = (state: GameState, ui: UiAdapter, self: CardInstance) => Promise<void>
export type FocusUsable = (state: GameState, self: CardInstance) => boolean

const focusEffects = new Map<string, { effect: FocusEffect; isUsable?: FocusUsable }>()

/** Efekt po "Focus N Recruit ->" danej karty. Koszt N jest w danych karty (pole focus).
 * isUsable (opcjonalne): dodatkowy warunek widoczności przycisku, np. "istnieje cel dla efektu". */
export function registerFocusEffect(cardId: string, effect: FocusEffect, isUsable?: FocusUsable): void {
  focusEffects.set(cardId, { effect, isUsable })
}

// Limit użyć liczy się per efekt (cardId), wspólnie dla wszystkich kopii karty zagranych w tej turze
function focusUses(state: GameState, instance: CardInstance): number {
  return state.focusUsesThisTurn?.[instance.cardId] ?? 0
}

/** Czy przycisk Focus ma być widoczny: karta ma Focus z zarejestrowanym efektem, gracza stać na koszt,
 * nie wyczerpano limitu użyć (focusLimit) i efekt ma sens (isUsable). */
export function canFocus(state: GameState, instance: CardInstance): boolean {
  if (state.status !== 'playing') return false
  const data = getCardData(state, instance)
  const entry = focusEffects.get(instance.cardId)
  if (!entry || data.focus === undefined || state.recruit < data.focus) return false
  if (data.focusLimit !== undefined && focusUses(state, instance) >= data.focusLimit) return false
  if (entry.isUsable && !entry.isUsable(state, instance)) return false
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
  if (!canFocus(state, instance)) throw new Error('Nie można teraz użyć Focusa tej karty')

  const entry = focusEffects.get(instance.cardId)!
  state.recruit -= getCardData(state, instance).focus!
  state.focusUsesThisTurn = {
    ...state.focusUsesThisTurn,
    [instance.cardId]: focusUses(state, instance) + 1,
  }
  await entry.effect(state, ui, instance)
}
