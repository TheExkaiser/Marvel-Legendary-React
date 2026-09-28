import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { getWoundReplacement } from './replacements'

/** Gracz zyskuje ranę, chyba że zamiennik (np. Diving Block) ją zastąpi. */
export async function gainWound(state: GameState, ui: UiAdapter): Promise<void> {
  for (const card of [...state.hand, ...state.played]) {
    const replacement = getWoundReplacement(card.cardId)
    if (replacement) {
      const replaced = await replacement(state, ui, card)
      if (replaced) return
    }
  }
  gainWoundSilent(state)
}

/** Rana do stosu odrzuconych z pominięciem zamienników. */
export function gainWoundSilent(state: GameState): void {
  const wound = state.wounds.pop()
  if (!wound) return
  state.discard.push(wound)
}

/** Uratowany bystander idzie prosto do Victory Pool. */
export function rescueBystander(state: GameState): void {
  const bystander = state.bystanders.pop()
  if (bystander) state.defeated.push(bystander)
}

/** Odkryty bystander zostaje jeńcem najdalszego złoczyńcy; bez złoczyńców idzie do KO. */
export async function captureBystander(
  state: GameState,
  bystander: CardInstance,
  ui: UiAdapter,
): Promise<void> {
  for (let i = state.city.length - 1; i >= 0; i--) {
    const villain = state.city[i]
    if (villain) {
      const list = state.captives[villain.instanceId] ?? []
      list.push(bystander)
      state.captives[villain.instanceId] = list
      await ui.showCapture(
        villain,
        bystander,
        `Bystander captured by ${state.cards[villain.cardId].name}`,
      )
      return
    }
  }
  state.ko.push(bystander)
}