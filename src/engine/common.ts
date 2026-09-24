import type { GameState } from './types'

/** Rzuca błąd, jeśli gra jest już zakończona (wygrana/przegrana). */
export function assertPlaying(state: GameState): void {
  if (state.status !== 'playing') throw new Error('Gra jest już zakończona')
}

/** Dopisuje wpis do logu gry (i do konsoli). */
export function logEvent(state: GameState, message: string): void {
  state.log.push(message)
  console.log(message)
}
