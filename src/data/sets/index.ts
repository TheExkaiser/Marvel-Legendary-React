import type { SchemeDef, SetData } from '../../engine/types'
import { CORE_SET } from './01_Core_Set'
import { DARK_CITY_SET } from './02_Dark_City'
import { FANTASTIC_FOUR_SET } from './03_Fantastic_Four'
import { PAINT_THE_TOWN_RED_SET } from './04_Paint_The_Town_Red'
import { GUARDIANS_OF_THE_GALAXY_SET } from './05_Guardians_Of_The_Galaxy'

// Wszystkie zestawy dostępne w grze. Dodatek = nowy folder + wpis tutaj
export const ALL_SETS: SetData[] = [CORE_SET, DARK_CITY_SET, FANTASTIC_FOUR_SET, PAINT_THE_TOWN_RED_SET, GUARDIANS_OF_THE_GALAXY_SET]

// Szuka scheme'u po id we wszystkich zestawach
export function findScheme(id: string): SchemeDef {
  for (const set of ALL_SETS) {
    const scheme = set.schemes.find((s) => s.id === id)
    if (scheme) return scheme
  }
  throw new Error(`Nie znaleziono scheme'u: ${id}`)
}
