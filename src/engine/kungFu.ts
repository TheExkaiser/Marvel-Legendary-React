import type { CardInstance, GameState } from './types'
import { getCardData } from './cardData'
import { revealCards } from './keywords'
import { registerStrengthModifier } from './strengthModifiers'

// Circle of Kung-Fu: "5th Circle of Kung-Fu" = w Twojej turze ten Villain/Mastermind ma +5 Attack, chyba że ujawnisz Bohatera kosztującego 5 lub więcej.
// Zwraca bonus do siły. Faza Villaina to nie Twoja tura, więc wtedy bonusu nie ma.
export function circleOfKungFuBonus(state: GameState, circle: number): number {
  if (state.villainPhaseActive) return 0
  const revealed = revealCards(state).some((card) => {
    const data = getCardData(state, card)
    return !!data.hero && (data.cost ?? 0) >= circle
  })
  return revealed ? 0 : circle
}

// Własny Circle karty (drukowany na karcie). Rejestr pozwala Schematowi, który daje Circle wszystkim,
// policzyć tylko najwyższy z nich, a nie sumę.
const ownCircles = new Map<string, number>()

/** Rejestruje Circle of Kung-Fu drukowany na karcie i jego bonus do siły. */
export function registerCircleOfKungFu(cardId: string, circle: number): void {
  ownCircles.set(cardId, circle)
  registerStrengthModifier(cardId, (state) => circleOfKungFuBonus(state, circle))
}

/** Circle nadany przez Scheme (Master the Mysteries of Kung-Fu). Jeśli karta ma własny Circle, liczy się tylko najwyższy,
 * więc dopłacamy samą różnicę ponad bonus, który karta już dostaje ze swojego Circle. */
export function schemeCircleOfKungFuBonus(state: GameState, instance: CardInstance, circle: number): number {
  if (circle <= 0) return 0
  const own = ownCircles.get(instance.cardId) ?? 0
  if (own >= circle) return 0
  return circleOfKungFuBonus(state, circle) - circleOfKungFuBonus(state, own)
}
