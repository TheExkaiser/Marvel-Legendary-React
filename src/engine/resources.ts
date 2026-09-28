import type { GameState } from './types'

/** Jedyne miejsce, które ma zwiększać Recruit — zlicza też ile go "zrobiono" w tej turze. */
export function addRecruit(state: GameState, amount: number): void {
  state.recruit += amount
  state.recruitGainedThisTurn += amount
}

/** Jedyne miejsce, które ma zwiększać Attack — zlicza też ile go "zrobiono" w tej turze. */
export function addAttack(state: GameState, amount: number): void {
  state.attack += amount
  state.attackGainedThisTurn += amount
}