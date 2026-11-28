import type { CardInstance, GameState } from './types'
import type { UiAdapter } from './ui'
import { activeCityIndexes } from './cityLayout'
import { escapeVillain } from './villainPhase'
import { isVillainCard } from './keywords'

/** Charge: Villain szarżuje o `spaces` pól do przodu (w stronę Bridge), pchając Villainów przed sobą.
 * Kto zostanie wypchnięty z Bridge, ucieka. Zniszczone pola nie istnieją i są pomijane. */
export async function chargeVillain(
  state: GameState,
  ui: UiAdapter,
  villain: CardInstance,
  spaces: number,
): Promise<void> {
  for (let step = 0; step < spaces; step++) {
    const active = activeCityIndexes(state)
    const position = active.findIndex((index) => state.city[index]?.instanceId === villain.instanceId)
    if (position === -1) return
    state.city[active[position]] = null
    if (position === 0) {
      await escapeVillain(state, villain, ui)
      return
    }
    let moving: CardInstance | null = villain
    for (let p = position - 1; p >= 0 && moving; p--) {
      const occupant: CardInstance | null = state.city[active[p]]
      state.city[active[p]] = moving
      moving = occupant
    }
    if (moving) await escapeVillain(state, moving, ui)
  }
}

/** Każda karta w mieście szarżuje jednocześnie o `spaces` pól do przodu (Deadlands Hordes Charge the Wall).
 * Wszystkie przesuwają się o tyle samo, więc nie pchają się nawzajem. Kto wyjdzie poza Bridge, ucieka (od najbliższego Bridge). */
export async function chargeAllVillains(state: GameState, ui: UiAdapter, spaces: number): Promise<void> {
  const active = activeCityIndexes(state)
  const moving = active.flatMap((index, position) => {
    const card = state.city[index]
    return card && isVillainCard(state.cards[card.cardId]) ? [{ card, position }] : []
  })
  for (const { position } of moving) state.city[active[position]] = null
  const escaping: CardInstance[] = []
  for (const { card, position } of moving) {
    const target = position - spaces
    if (target < 0) escaping.push(card)
    else state.city[active[target]] = card
  }
  for (const card of escaping) await escapeVillain(state, card, ui)
}
