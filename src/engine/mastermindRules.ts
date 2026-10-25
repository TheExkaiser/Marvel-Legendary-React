import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'

export interface MastermindRule {
  checkLoss?: (state: GameState) => boolean
  villainStrengthModifier?: (state: GameState, instance: CardInstance) => number
  // Wywoływany po kliknięciu w Mastermina, przed policzeniem siły (Galactus: Cosmic Threat). false = walka anulowana
  beforeFight?: (state: GameState, ui: UiAdapter) => Promise<boolean>
  // Siły Mastermina, przy których walka jest do wykonania (UI podświetla Mastermina, gdy którakolwiek jest w zasięgu).
  // Bez tego pola liczy się bieżąca siła. Galactus: siły po Cosmic Threat dla każdej wybieralnej klasy.
  fightStrengthOptions?: (state: GameState) => number[]
  woundsToDeckTop?: boolean // Mephisto: zdobyte Rany trafiają na wierzch talii zamiast do odrzuconych
}

const rules = new Map<string, MastermindRule>()

export function registerMastermindRule(mastermindCardId: string, rule: MastermindRule): void {
  rules.set(mastermindCardId, rule)
}

export function getMastermindRule(state: GameState): MastermindRule | undefined {
  return rules.get(state.mastermind.cardId)
}

