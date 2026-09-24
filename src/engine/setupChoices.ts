import type { SetData, SetupChoices } from './types'
import { resolveRules } from './setupRules'

export const EMPTY_CHOICES: SetupChoices = {
  schemeId: '',
  mastermindId: '',
  heroIds: [],
  villainGroupIds: [],
  henchmenGroupIds: [],
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
  if (items.length === 0) throw new Error(`Brak dostępnych elementów: ${what}`)
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

/**
 * Uzupełnia niepełne wybory losowo. Wywołane z `{}` losuje wszystko,
 * wywołane z bieżącymi wyborami dolosowuje tylko to, czego brakuje.
 */
export function completeChoices(
  partial: Partial<SetupChoices>,
  sets: SetData[],
  rng: Rng = Math.random,
): SetupChoices {
  const schemes = sets.flatMap((s) => s.schemes)
  const masterminds = sets.flatMap((s) => s.masterminds)

  const scheme =
    schemes.find((s) => s.id === partial.schemeId) ?? randomItem(schemes, rng, 'scheme')
  const mastermind =
    masterminds.find((m) => m.card.id === partial.mastermindId) ??
    randomItem(masterminds, rng, 'mastermind')
  const rules = resolveRules(scheme)

  const ids = (groups: { id: string }[]) => groups.map((g) => g.id)
  return {
    schemeId: scheme.id,
    mastermindId: mastermind.card.id,
    heroIds: fillIds(partial.heroIds ?? [], ids(sets.flatMap((s) => s.heroes)), rules.heroes, rules.requiredHeroes, rng),
    villainGroupIds: fillIds(partial.villainGroupIds ?? [], ids(sets.flatMap((s) => s.villainGroups)), rules.villainGroups, rules.requiredVillainGroups, rng),
    henchmenGroupIds: fillIds(partial.henchmenGroupIds ?? [], ids(sets.flatMap((s) => s.henchmenGroups)), rules.henchmenGroups, rules.requiredHenchmenGroups, rng),
  }
}

/** Usuwa z wyborów id, których nie ma w podanych zestawach (po wyłączeniu setu). */
export function pruneChoices(choices: SetupChoices, sets: SetData[]): SetupChoices {
  const has = (pool: { id: string }[], id: string) => pool.some((x) => x.id === id)
  const keep = (pool: { id: string }[], list: string[]) => list.filter((id) => has(pool, id))
  return {
    schemeId: has(sets.flatMap((s) => s.schemes), choices.schemeId) ? choices.schemeId : '',
    mastermindId: sets.some((s) => s.masterminds.some((m) => m.card.id === choices.mastermindId))
      ? choices.mastermindId
      : '',
    heroIds: keep(sets.flatMap((s) => s.heroes), choices.heroIds),
    villainGroupIds: keep(sets.flatMap((s) => s.villainGroups), choices.villainGroupIds),
    henchmenGroupIds: keep(sets.flatMap((s) => s.henchmenGroups), choices.henchmenGroupIds),
  }
}
