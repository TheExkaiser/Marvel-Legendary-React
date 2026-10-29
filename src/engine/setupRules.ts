import type { GameModeDef, MastermindData, SchemeDef, SetupRules } from './types'

// Domyślne reguły gry solo — odpowiadają Dark City - Advanced Solo (jedynemu trybowi na razie).
export const DEFAULT_SETUP_RULES: SetupRules = {
  heroes: 3,
  villainGroups: 1,
  henchmenGroups: 1,
  henchmenCopiesPerGroup: 10,
  bystandersInVillainDeck: 1,
  bystandersInHeroDeck: 0,
  villainDeckHeroes: 0,
  requiredVillainDeckHeroes: [],
  requiredHeroes: [],
  requiredVillainGroups: [],
  requiredHenchmenGroups: [],
  requiredBystanderGroups: ['coreset_bystanders'],
}

// Always Leads jest domyślnie wyłączone; pojedynczy Mastermind może wymusić swoją grupę.
const ALWAYS_LEADS_ENABLED = false

/** Domyślne reguły + nadpisania z Game Mode + nadpisania z Scheme (Scheme wygrywa)
 * + Always Leads mastermina (jeśli ma to pole — w tym trybie tylko Apocalypse). */
export function resolveRules(
  gameMode: GameModeDef,
  scheme: SchemeDef,
  mastermind?: MastermindData,
): SetupRules {
  const rules = { ...DEFAULT_SETUP_RULES, ...gameMode.setupRules, ...scheme.setupRules }
  const led =
    ALWAYS_LEADS_ENABLED || mastermind?.alwaysLeadsForced
      ? mastermind?.alwaysLeads?.villainGroupId
      : undefined
  if (led) rules.requiredVillainGroups = [...new Set([...rules.requiredVillainGroups, led])]
  return rules
}

/** Po wyborze mastermina z Always Leads dokleja jego grupę do wybranych (zastępując ostatnią, jeśli brak miejsca). */
export function withLedGroup(ids: string[], mastermind: MastermindData | undefined, max: number): string[] {
  const led =
    ALWAYS_LEADS_ENABLED || mastermind?.alwaysLeadsForced
      ? mastermind?.alwaysLeads?.villainGroupId
      : undefined
  if (!led || ids.includes(led)) return ids
  return [...ids.slice(0, Math.max(0, max - 1)), led]
}
