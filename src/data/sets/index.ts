import type { SchemeDef, SetData } from '../../engine/types'
import { CORE_SET } from './01_Core_Set'

// Wszystkie zestawy dostępne w grze. Dodatek = nowy folder + wpis tutaj
export const ALL_SETS: SetData[] = [CORE_SET]

// Szuka scheme'u po id we wszystkich zestawach
export function findScheme(id: string): SchemeDef {
  for (const set of ALL_SETS) {
    const scheme = set.schemes.find((s) => s.id === id)
    if (scheme) return scheme
  }
  throw new Error(`Nie znaleziono scheme'u: ${id}`)
}