import type { GameState, CardInstance } from './types'

export interface MastermindRule {
  checkLoss?: (state: GameState) => boolean
  villainStrengthModifier?: (state: GameState, instance: CardInstance) => number
  woundsToDeckTop?: boolean // Mephisto: zdobyte Rany trafiają na wierzch talii zamiast do odrzuconych
}

const rules = new Map<string, MastermindRule>()

export function registerMastermindRule(mastermindCardId: string, rule: MastermindRule): void {
  rules.set(mastermindCardId, rule)
}

export function getMastermindRule(state: GameState): MastermindRule | undefined {
  return rules.get(state.mastermind.cardId)
}

