import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'

export interface MastermindRule {
  checkLoss?: (state: GameState) => boolean
  villainStrengthModifier?: (state: GameState, instance: CardInstance) => number
  // Wywoływany po kliknięciu w Mastermina, przed policzeniem siły (Galactus: Cosmic Threat). false = walka anulowana
  beforeFight?: (state: GameState, ui: UiAdapter) => Promise<boolean>
  woundsToDeckTop?: boolean // Mephisto: zdobyte Rany trafiają na wierzch talii zamiast do odrzuconych
}

const rules = new Map<string, MastermindRule>()

export function registerMastermindRule(mastermindCardId: string, rule: MastermindRule): void {
  rules.set(mastermindCardId, rule)
}

export function getMastermindRule(state: GameState): MastermindRule | undefined {
  return rules.get(state.mastermind.cardId)
}

