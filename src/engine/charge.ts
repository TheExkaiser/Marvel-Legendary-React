import type { CardInstance, GameState } from './types'
import type { UiAdapter } from './ui'
import { activeCityIndexes } from './cityLayout'
import { escapeVillain } from './villainPhase'

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
