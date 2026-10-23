import type { GameState } from './types'

// Galactus niszczy pola miasta. Zniszczone pole "nie istnieje": Villainowie nie mogą w nie wchodzić,
// ruch i sąsiedztwo liczą się tylko po istniejących polach. state.cityDestroyed[i] trzyma kartę Master Strike leżącą na polu.

export function isCityDestroyed(state: GameState, index: number): boolean {
  return !!state.cityDestroyed?.[index]
}

/** Indeksy istniejących (niezniszczonych) pól miasta, od Bridge (0) do Sewers. */
export function activeCityIndexes(state: GameState): number[] {
  return state.city.map((_, i) => i).filter((i) => !isCityDestroyed(state, i))
}

/** Sąsiednie istniejące pola: najbliższe niezniszczone po każdej stronie. */
export function adjacentCityIndexes(state: GameState, index: number): number[] {
  const active = activeCityIndexes(state)
  const position = active.indexOf(index)
  if (position === -1) return []
  return [active[position - 1], active[position + 1]].filter((i): i is number => i !== undefined)
}
