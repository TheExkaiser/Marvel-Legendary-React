import type { GameState } from './types'
import { CITY_NAMES } from './constants'
import { activeCityIndexes, isCityDestroyed } from './cityLayout'

// Patrol: stan wskazanego miejsca w chwili zagrania karty (sprawdzany raz, nie później w turze).
//   'empty'       - pole istnieje i nie ma na nim żadnej karty
//   'occupied'    - pole istnieje i leży na nim karta
//   'unavailable' - pole nie istnieje (zniszczone przez Mastermind lub Scheme), więc nie można go patrolować
export type PatrolResult = 'empty' | 'occupied' | 'unavailable'

/** Patrol pola miasta (nazwa z CITY_NAMES, np. 'Bank' albo 'Sewers'). */
export function patrolCitySpace(state: GameState, space: string): PatrolResult {
  const index = CITY_NAMES.indexOf(space)
  if (index === -1) throw new Error(`Patrol: nie ma pola miasta "${space}"`)
  if (isCityDestroyed(state, index)) return 'unavailable'
  return state.city[index] ? 'occupied' : 'empty'
}

/** Pary sąsiednich istniejących pól miasta, które są obie puste (Patrol two adjacent city spaces).
 * Pary to kolejne pola z activeCityIndexes, więc zniszczone pole nie istnieje i sąsiedztwo je pomija. */
export function emptyAdjacentCityPairs(state: GameState): [number, number][] {
  const active = activeCityIndexes(state)
  const pairs: [number, number][] = []
  for (let i = 0; i + 1 < active.length; i++) {
    if (!state.city[active[i]] && !state.city[active[i + 1]]) pairs.push([active[i], active[i + 1]])
  }
  return pairs
}
