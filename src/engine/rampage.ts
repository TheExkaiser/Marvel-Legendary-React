import type { CardInstance, GameState } from './types'
import type { UiAdapter } from './ui'
import { revealOneOr } from './abilityHelpers'
import { matchesRampageCharacter, revealCards } from './keywords'
import { gainWound } from './wounds'

/** Cross-Dimensional <postać> Rampage: odkryj kartę tej postaci (ręka, zagrane, Artifacty lub Victory Pile),
 * w przeciwnym razie zdobądź Wound. onFail pozwala dodać efekt uboczny (Rage Out). */
export async function crossDimensionalRampage(
  state: GameState,
  ui: UiAdapter,
  character: string,
  excludeInstanceId?: string,
  onFail: () => Promise<void> = () => gainWound(state, ui),
): Promise<void> {
  const found = [...revealCards(state), ...state.defeated].find(
    (card: CardInstance) => card.instanceId !== excludeInstanceId && matchesRampageCharacter(state, card, character),
  )
  await revealOneOr(
    ui,
    found ? [found] : [],
    `Cross-Dimensional ${character} Rampage: reveal a ${character} card.`,
    `Cross-Dimensional ${character} Rampage: revealed a ${character} card`,
    onFail,
  )
}
