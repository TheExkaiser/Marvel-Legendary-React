import type { GameModeDef, GameSetup, SetData, SetupChoices, SetupRules, DeckEntry } from './types'
import { resolveRules } from './setupRules'

/** Szuka elementu po id; getId mówi, skąd wziąć id (masterminda mają je w card.id). */
function pick<T>(items: T[], getId: (item: T) => string, id: string, what: string): T {
  const found = items.find((item) => getId(item) === id)
  if (!found) throw new Error(`Nie znaleziono (${what}): ${id}`)
  return found
}

function checkList(
  label: string,
  ids: string[],
  expected: number,
  required: string[],
  problems: string[],
): void {
  if (ids.length !== expected) {
    problems.push(`${label}: wybrano ${ids.length}, wymagane ${expected}`)
  }
  if (new Set(ids).size !== ids.length) {
    problems.push(`${label}: ten sam element wybrany dwa razy`)
  }
  for (const id of required) {
    if (!ids.includes(id)) problems.push(`${label}: brakuje wymaganego elementu ${id}`)
  }
}

/** Lista problemów z wyborami (pusta = OK). Menu użyje tego do pokazywania błędów bez wyjątków. */
export function getSetupProblems(choices: SetupChoices, rules: SetupRules): string[] {
  const problems: string[] = []
  checkList('Bohaterowie', choices.heroIds, rules.heroes, rules.requiredHeroes, problems)
  checkList(
    'Grupy villainów',
    choices.villainGroupIds,
    rules.villainGroups,
    rules.requiredVillainGroups,
    problems,
  )
  checkList(
    'Grupy henchmenów',
    choices.henchmenGroupIds,
    rules.henchmenGroups,
    rules.requiredHenchmenGroups,
    problems,
  )
  return problems
}

/** Przycina liczbę kopii w każdym DeckEntry do maxCount (nie mutuje oryginałów z cards.ts). */
function capCounts(entries: DeckEntry[], maxCount: number): DeckEntry[] {
  return entries.map((entry) => ({ ...entry, count: Math.min(entry.count, maxCount) }))
}

/** Czysta funkcja: wybory + dostępne sety + dostępne game mode'y -> GameSetup gotowy dla createGameState. */
export function buildSetup(choices: SetupChoices, sets: SetData[], gameModes: GameModeDef[]): GameSetup {
  const gameMode = pick(gameModes, (m) => m.id, choices.gameModeId, 'game mode')
  const scheme = pick(sets.flatMap((s) => s.schemes), (s) => s.id, choices.schemeId, 'scheme')
  const rules = resolveRules(gameMode, scheme)

  const problems = getSetupProblems(choices, rules)
  if (problems.length > 0) throw new Error(`Niepoprawny setup:\n${problems.join('\n')}`)

  const mastermind = pick(
    sets.flatMap((s) => s.masterminds),
    (m) => m.card.id,
    choices.mastermindId,
    'mastermind',
  )

  const heroPool = sets.flatMap((s) => s.heroes)
  const villainPool = sets.flatMap((s) => s.villainGroups)
  const henchmenPool = sets.flatMap((s) => s.henchmenGroups)

  const heroes = choices.heroIds.map((id) => pick(heroPool, (g) => g.id, id, 'bohater'))
  const villains = choices.villainGroupIds.map((id) =>
    pick(villainPool, (g) => g.id, id, 'grupa villainów'),
  )
  const henchmen = choices.henchmenGroupIds.map((id) =>
    pick(henchmenPool, (g) => g.id, id, 'grupa henchmenów'),
  )

  // Na razie bierzemy karty wspólne z pierwszego zestawu, który je ma (Core Set)
  const shared = sets.map((s) => s.shared).find((s) => s !== undefined)
  if (!shared) throw new Error('Żaden wybrany zestaw nie zawiera kart wspólnych (rany, oficerowie...)')

  return {
    startingCards: shared.startingCards,
    heroCards: heroes.flatMap((g) => g.cards),
    officerCards: shared.officer,
    villainCards: [
      ...villains.flatMap((g) => g.cards),
      ...henchmen.flatMap((g) => capCounts(g.cards, rules.henchmenCopiesPerGroup)),
    ],
    mastermind,
    wounds: shared.wounds,
    bystanders: shared.bystanders,
    bystandersInVillainDeck: rules.bystandersInVillainDeck,
    masterStrikeCard: shared.masterStrikeCard,
    masterStrikeCount: shared.masterStrikeCount,
    scheme,
    gameMode,
    twist: shared.twist,
  }
}