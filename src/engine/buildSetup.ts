import type { GameModeDef, GameSetup, SetData, SetupChoices, SetupRules, DeckEntry } from './types'
import { resolveRules } from './setupRules'

/** Szuka elementu po id; getId mówi, skąd wziąć id (masterminda mają je w card.id). */
function pick<T>(items: T[], getId: (item: T) => string, id: string, what: string): T {
  const found = items.find((item) => getId(item) === id)
  if (!found) throw new Error(`Not found (${what}): ${id}`)
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
    problems.push(`${label}: selected ${ids.length}, required ${expected}`)
  }
  if (new Set(ids).size !== ids.length) {
    problems.push(`${label}: the same item is selected twice`)
  }
  for (const id of required) {
    if (!ids.includes(id)) problems.push(`${label}: missing required item ${id}`)
  }
}

/** Lista problemów z wyborami (pusta = OK). Menu użyje tego do pokazywania błędów bez wyjątków. */
export function getSetupProblems(choices: SetupChoices, rules: SetupRules): string[] {
  const problems: string[] = []
  checkList('Heroes', choices.heroIds, rules.heroes, rules.requiredHeroes, problems)
  checkList(
    'Villain Groups',
    choices.villainGroupIds,
    rules.villainGroups,
    rules.requiredVillainGroups,
    problems,
  )
  checkList(
    'Henchmen',
    choices.henchmenGroupIds,
    rules.henchmenGroups,
    rules.requiredHenchmenGroups,
    problems,
  )
  checkList(
    'Villain Deck Heroes',
    choices.villainDeckHeroIds,
    rules.villainDeckHeroes,
    rules.requiredVillainDeckHeroes,
    problems,
  )
  for (const id of choices.villainDeckHeroIds) {
    if (choices.heroIds.includes(id)) problems.push(`Villain Deck Heroes: ${id} is also selected as a Hero`)
  }
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
  if (problems.length > 0) throw new Error(`Invalid setup:\n${problems.join('\n')}`)

  const mastermind = pick(
    sets.flatMap((s) => s.masterminds),
    (m) => m.card.id,
    choices.mastermindId,
    'mastermind',
  )

  const heroPool = sets.flatMap((s) => s.heroes)
  const villainPool = sets.flatMap((s) => s.villainGroups)
  const henchmenPool = sets.flatMap((s) => s.henchmenGroups)

  const heroes = choices.heroIds.map((id) => pick(heroPool, (g) => g.id, id, 'hero'))
  const villains = choices.villainGroupIds.map((id) =>
    pick(villainPool, (g) => g.id, id, 'villain group'),
  )
  const henchmen = choices.henchmenGroupIds.map((id) =>
    pick(henchmenPool, (g) => g.id, id, 'henchmen group'),
  )
  const villainDeckHeroes = choices.villainDeckHeroIds.map((id) =>
    pick(heroPool, (g) => g.id, id, 'villain deck hero'),
  )

  // Na razie bierzemy karty wspólne z pierwszego zestawu, który je ma (Core Set)
  const shared = sets.map((s) => s.shared).find((s) => s !== undefined)
  if (!shared) throw new Error('None of the selected sets contains shared cards (wounds, officers...)')

  return {
    startingCards: shared.startingCards,
    heroCards: heroes.flatMap((g) => g.cards),
    villainDeckHeroCards: villainDeckHeroes.flatMap((g) => g.cards),
    officerCards: shared.officer,
    villainCards: [
      ...villains.flatMap((g) => g.cards),
      ...henchmen.flatMap((g) => capCounts(g.cards, rules.henchmenCopiesPerGroup)),
    ],
    mastermind,
    wounds: shared.wounds,
    bystanders: shared.bystanders,
    bystandersInVillainDeck: rules.bystandersInVillainDeck,
    bystandersInHeroDeck: rules.bystandersInHeroDeck,
    masterStrikeCard: shared.masterStrikeCard,
    masterStrikeCount: shared.masterStrikeCount,
    scheme,
    gameMode,
    twist: shared.twist,
  }
}
