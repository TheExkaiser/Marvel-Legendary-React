import type { SchemeDef, SetupRules } from './types'

// Domyślne reguły gry solo. TEST: sprawdź liczby w instrukcji
export const DEFAULT_SETUP_RULES: SetupRules = {
  heroes: 3,
  villainGroups: 1,
  henchmenGroups: 1,
  bystandersInVillainDeck: 1,
  requiredHeroes: [],
  requiredVillainGroups: [],
  requiredHenchmenGroups: [],
}

/** Domyślne reguły + nadpisania z scheme'u (jak `with` na rekordzie w C#). */
export function resolveRules(scheme: SchemeDef): SetupRules {
  return { ...DEFAULT_SETUP_RULES, ...scheme.setupRules }
}
