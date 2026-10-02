import type { GameState } from './types'

/** Jedyne miejsce, które ma zwiększać Recruit — zlicza też ile go "zrobiono" w tej turze. */
export function addRecruit(state: GameState, amount: number): void {
  const before = state.recruitGainedThisTurn
  state.recruit += amount
  state.recruitGainedThisTurn += amount

  // Surge of Power (Thor): warunek "8+ Recruit w tej turze" może zostać spełniony PÓŹNIEJ,
  // nie tylko w momencie zagrania karty — gdy próg właśnie zostaje przekroczony,
  // doliczamy zaległy bonus za każdą czekającą kartę.
  if (before < 8 && state.recruitGainedThisTurn >= 8 && state.pendingSurgeOfPower > 0) {
    const count = state.pendingSurgeOfPower
    state.pendingSurgeOfPower = 0
    addAttack(state, 3 * count)
  }
}

/** Jedyne miejsce, które ma zwiększać Attack — zlicza też ile go "zrobiono" w tej turze. */
export function addAttack(state: GameState, amount: number): void {
  state.attack += amount
  state.attackGainedThisTurn += amount
}