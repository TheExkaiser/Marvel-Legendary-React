import type { CardGroup, GameModeDef, HeroSelectionMode, SetData, SetupChoices } from './types'
import { resolveRules } from './setupRules'

export const EMPTY_CHOICES: SetupChoices = {
  gameModeId: '',
  schemeId: '',
  mastermindId: '',
  heroIds: [],
  villainDeckHeroIds: [],
  villainGroupIds: [],
  henchmenGroupIds: [],
  excludedBystanderGroupIds: [],
  heroSelectionMode: 'full-random',
  uniqueHeroRealNames: true,
}

// rng można podmienić (np. na generator z ziarnem w trybie debug)
type Rng = () => number

function shuffled<T>(items: T[], rng: Rng): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomItem<T>(items: T[], rng: Rng, what: string): T {
  if (items.length === 0) throw new Error(`No available options: ${what}`)
  return items[Math.floor(rng() * items.length)]
}

/** Wymagane najpierw, potem to, co już wybrane, potem losowe do wypełnienia `count`. */
function fillIds(current: string[], pool: string[], count: number, required: string[], rng: Rng): string[] {
  const inPool = (id: string) => pool.includes(id)
  const result = [...new Set([...required.filter(inPool), ...current.filter(inPool)])].slice(0, count)
  const candidates = shuffled(pool.filter((id) => !result.includes(id)), rng)
  while (result.length < count && candidates.length > 0) {
    result.push(candidates.pop()!)
  }
  return result
}

function groupTags(group: CardGroup, key: 'team' | 'type'): string[] {
  return [...new Set(group.cards.flatMap((entry) => entry.card[key] ?? []))]
}

function fillHeroes(
  current: string[],
  groups: CardGroup[],
  count: number,
  required: string[],
  mode: HeroSelectionMode,
  rng: Rng,
  uniqueRealNames = false,
): string[] {
  const available = groups.filter((group) => !current.includes(group.id))
  const requiredIds = required.filter((id) => groups.some((group) => group.id === id))
  const kept = [...new Set([...requiredIds, ...current.filter((id) => groups.some((group) => group.id === id))])].slice(0, count)
  if (kept.length >= count || mode === 'full-random') {
    return fillHeroIds(kept, groups, count, required, rng, uniqueRealNames)
  }

  const tagKey = mode.startsWith('team') ? 'team' : 'type'
  const tagCounts = new Map<string, number>()
  for (const group of available) {
    for (const tag of groupTags(group, tagKey)) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
  }
  const tags = [...tagCounts.keys()]
  if (tags.length === 0) return fillHeroIds(kept, groups, count, required, rng, uniqueRealNames)
  const bestCount = Math.max(...tags.map((tag) => tagCounts.get(tag) ?? 0))
  const slotsToFill = count - kept.length
  // Team Full nie powinien preferować największego teamu (np. X-Menów) za
  // każdym razem. Najpierw losujemy spośród teamów, które są w stanie
  // samodzielnie wypełnić brakujące miejsca. Jeśli żaden nie jest tak duży,
  // zostaje bezpieczny fallback do największej dostępnej grupy.
  const fullCandidates = mode.endsWith('full')
    ? tags.filter((tag) => (tagCounts.get(tag) ?? 0) >= slotsToFill)
    : []
  const targetTags = fullCandidates.length > 0
    ? fullCandidates
    : tags.filter((tag) => tagCounts.get(tag) === bestCount)
  const target = targetTags[Math.floor(rng() * targetTags.length)]
  const matching = available.filter((group) => groupTags(group, tagKey).includes(target))
  const preferredCount = mode.endsWith('full') ? count - kept.length : Math.ceil((count - kept.length) / 2)
  const preferred = shuffled(matching, rng).slice(0, preferredCount).map((group) => group.id)
  return fillHeroIds([...kept, ...preferred], groups, count, required, rng, uniqueRealNames)
}

function fillHeroIds(
  current: string[],
  groups: CardGroup[],
  count: number,
  required: string[],
  rng: Rng,
  uniqueRealNames: boolean,
): string[] {
  const byId = new Map(groups.map((group) => [group.id, group]))
  const result = [...new Set(required.filter((id) => byId.has(id)).concat(current.filter((id) => byId.has(id))))].slice(0, count)
  const usedNames = new Set(
    result
      .map((id) => byId.get(id)?.realName)
      .filter((name): name is string => Boolean(name)),
  )
  const candidates = shuffled(
    groups.filter((group) => !result.includes(group.id) && (!uniqueRealNames || !group.realName || !usedNames.has(group.realName))),
    rng,
  )
  for (const group of candidates) {
    if (result.length >= count) break
    result.push(group.id)
    if (uniqueRealNames && group.realName) usedNames.add(group.realName)
  }
  return result
}

/** Losuje bohaterów od zera, z zachowaniem wybranego trybu dopasowania. */
export function randomizeHeroIds(
  groups: CardGroup[],
  count: number,
  required: string[] = [],
  mode: HeroSelectionMode = 'full-random',
  rng: Rng = Math.random,
  uniqueRealNames = false,
): string[] {
  return fillHeroes([], groups, count, required, mode, rng, uniqueRealNames)
}

/**
 * Uzupełnia niepełne wybory losowo. Wywołane z `{}` losuje wszystko,
 * wywołane z bieżącymi wyborami dolosowuje tylko to, czego brakuje.
 */
export function completeChoices(
  partial: Partial<SetupChoices>,
  sets: SetData[],
  gameModes: GameModeDef[],
  rng: Rng = Math.random,
): SetupChoices {
  const schemes = sets.flatMap((s) => s.schemes)
  const masterminds = sets.flatMap((s) => s.masterminds)

  const gameMode =
    gameModes.find((m) => m.id === partial.gameModeId) ?? randomItem(gameModes, rng, 'game mode')
  const scheme =
    schemes.find((s) => s.id === partial.schemeId) ?? randomItem(schemes, rng, 'scheme')
  const mastermind =
    masterminds.find((m) => m.card.id === partial.mastermindId) ??
    randomItem(masterminds, rng, 'mastermind')
  const rules = resolveRules(gameMode, scheme, mastermind)

  const ids = (groups: { id: string }[]) => groups.map((g) => g.id)
  const heroPool = ids(sets.flatMap((s) => s.heroes))
  const bystanderPool = ids(sets.flatMap((s) => s.bystanderGroups))

  // Najpierw bohaterowie do talii złoczyńców, żeby zwykli bohaterowie ich nie wybrali
  const villainDeckHeroIds =
    rules.villainDeckHeroes === 0
      ? []
      : fillIds(partial.villainDeckHeroIds ?? [], heroPool, rules.villainDeckHeroes, rules.requiredVillainDeckHeroes, rng)

  const heroSelectionMode = partial.heroSelectionMode ?? 'full-random'
  const uniqueHeroRealNames = partial.uniqueHeroRealNames ?? true
  const villainDeckRealNames = new Set(
    villainDeckHeroIds
      .map((id) => sets.flatMap((set) => set.heroes).find((group) => group.id === id)?.realName)
      .filter((name): name is string => Boolean(name)),
  )
  const heroGroups = sets
    .flatMap((s) => s.heroes)
    .filter((group) => !villainDeckHeroIds.includes(group.id))
    .filter((group) => !uniqueHeroRealNames || !group.realName || !villainDeckRealNames.has(group.realName))

  return {
    gameModeId: gameMode.id,
    schemeId: scheme.id,
    mastermindId: mastermind.card.id,
    heroIds: fillHeroes(
      partial.heroIds ?? [],
      heroGroups,
      rules.heroes,
      rules.requiredHeroes,
      heroSelectionMode,
      rng,
      uniqueHeroRealNames,
    ),
    villainDeckHeroIds,
    villainGroupIds: fillIds(partial.villainGroupIds ?? [], ids(sets.flatMap((s) => s.villainGroups)), rules.villainGroups, rules.requiredVillainGroups, rng),
    henchmenGroupIds: fillIds(partial.henchmenGroupIds ?? [], ids(sets.flatMap((s) => s.henchmenGroups)), rules.henchmenGroups, rules.requiredHenchmenGroups, rng),
    excludedBystanderGroupIds: (partial.excludedBystanderGroupIds ?? []).filter(
      (id) => bystanderPool.includes(id) && !rules.requiredBystanderGroups.includes(id),
    ),
    heroSelectionMode,
  }
}

/** Usuwa z wyborów id, których nie ma w podanych zestawach/game modach (po wyłączeniu setu). */
export function pruneChoices(choices: SetupChoices, sets: SetData[], gameModes: GameModeDef[]): SetupChoices {
  const has = (pool: { id: string }[], id: string) => pool.some((x) => x.id === id)
  const keep = (pool: { id: string }[], list: string[]) => list.filter((id) => has(pool, id))
  return {
    gameModeId: gameModes.some((m) => m.id === choices.gameModeId) ? choices.gameModeId : '',
    schemeId: has(sets.flatMap((s) => s.schemes), choices.schemeId) ? choices.schemeId : '',
    mastermindId: sets.some((s) => s.masterminds.some((m) => m.card.id === choices.mastermindId))
      ? choices.mastermindId
      : '',
    heroIds: keep(sets.flatMap((s) => s.heroes), choices.heroIds),
        villainDeckHeroIds: keep(sets.flatMap((s) => s.heroes), choices.villainDeckHeroIds ?? []),
    villainGroupIds: keep(sets.flatMap((s) => s.villainGroups), choices.villainGroupIds),
    henchmenGroupIds: keep(sets.flatMap((s) => s.henchmenGroups), choices.henchmenGroupIds),
    excludedBystanderGroupIds: keep(sets.flatMap((s) => s.bystanderGroups), choices.excludedBystanderGroupIds ?? []),
    heroSelectionMode: choices.heroSelectionMode ?? 'full-random',
    uniqueHeroRealNames: choices.uniqueHeroRealNames ?? true,
  }
}
