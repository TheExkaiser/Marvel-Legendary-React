import type { GameState } from './types'
import { getCardData } from './cardData'
import { revealCards } from './keywords'

// Circle of Kung-Fu: "5th Circle of Kung-Fu" = w Twojej turze ten Villain/Mastermind ma +5 Attack, chyba że ujawnisz Bohatera kosztującego 5 lub więcej.
// Zwraca bonus do siły. Faza Villaina to nie Twoja tura, więc wtedy bonusu nie ma.
// (Gdy Scheme da Villainowi drugi Circle, liczy się tylko najwyższy: wywołujący podaje wtedy najwyższy numer.)
export function circleOfKungFuBonus(state: GameState, circle: number): number {
  if (state.villainPhaseActive) return 0
  const revealed = revealCards(state).some((card) => {
    const data = getCardData(state, card)
    return !!data.hero && (data.cost ?? 0) >= circle
  })
  return revealed ? 0 : circle
}
