import type { GameModeDef, SchemeDef, SetupRules } from './types'

// Domyślne reguły gry solo — odpowiadają Dark City - Advanced Solo (jedynemu trybowi na razie).
export const DEFAULT_SETUP_RULES: SetupRules = {
  heroes: 3,
  villainGroups: 1,
  henchmenGroups: 1,
  henchmenCopiesPerGroup: 10,
  bystandersInVillainDeck: 1,
  requiredHeroes: [],
  requiredVillainGroups: [],
  requiredHenchmenGroups: [],
}

/** Domyślne reguły + nadpisania z Game Mode + nadpisania z Scheme (Scheme wygrywa). */
export function resolveRules(gameMode: GameModeDef, scheme: SchemeDef): SetupRules {
  return { ...DEFAULT_SETUP_RULES, ...gameMode.setupRules, ...scheme.setupRules }
}