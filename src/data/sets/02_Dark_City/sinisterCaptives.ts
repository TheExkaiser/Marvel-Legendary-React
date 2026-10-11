import type { CardInstance, GameState } from '../../../engine/types'

export const SINISTER_TACTIC_IDS = [
  'sinister-human-experimentation',
  'sinister-master-geneticist',
  'sinister-plans-within-plans',
  'sinister-telepathic-manipulation',
]

export function sinisterBystanderCount(state: GameState): number {
  return (state.captives[state.mastermind.instanceId] ?? []).length
}

export function captureForSinister(state: GameState, cards: CardInstance[]): void {
  if (cards.length === 0) return
  const id = state.mastermind.instanceId
  state.captives[id] = [...(state.captives[id] ?? []), ...cards]
}

/** Zdejmuje do `count` Bystanderów ze stosu (zwraca tylko tylu, ilu faktycznie było). */
export function captureFromSupply(state: GameState, count: number): CardInstance[] {
  const taken: CardInstance[] = []
  for (let i = 0; i < count; i++) {
    const bystander = state.bystanders.pop()
    if (!bystander) break
    taken.push(bystander)
  }
  return taken
}