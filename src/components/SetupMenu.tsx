import { useMemo, useState } from 'react'
import type { CardGroup, GameSetup, SetData, SetupChoices } from '../engine/types'
import { buildSetup, getSetupProblems } from '../engine/buildSetup'
import { DEFAULT_SETUP_RULES, resolveRules, withLedGroup, withRequiredBystanderGroups } from '../engine/setupRules'
import { EMPTY_CHOICES, completeChoices, pruneChoices } from '../engine/setupChoices'
import { GAME_MODES } from '../data/gameModes'
import { DEBUG_PRESET } from '../data/sets/setup'
import { consumePendingSetupChoices, type GameLogMeta } from '../gameLog'
import { GameHistoryMenu } from './GameHistoryMenu'
import { teamIcon, teamName } from '../data/teams'
import './SetupMenu.css'

interface SetupMenuProps {
  sets: SetData[]
  onStart: (setup: GameSetup, logMeta: GameLogMeta) => void
}

type SortMode = 'alpha' | 'set' | 'team'
// Kategoria = jedna lista kafelków z własnym wyborem. Zakładka = jedna albo kilka kategorii.
type CategoryId = 'mastermind' | 'heroes' | 'deckHeroes' | 'villains' | 'henchmen' | 'bystanders'
type TabId = 'mastermind' | 'heroes' | 'deckHeroes' | 'villains' | 'henchmen' | 'extras'

const TAB_ORDER: TabId[] = ['mastermind', 'heroes', 'deckHeroes', 'villains', 'henchmen', 'extras']

// Extras zbiera opcjonalne dodatki z zestawów (na razie Bystanders; później np. specjalne Wounds, Sidekicks).
// Nowy rodzaj dodatku = nowa kategoria dopisana tutaj i w `categories` poniżej.
const TAB_CATEGORIES: Record<TabId, CategoryId[]> = {
  mastermind: ['mastermind'],
  heroes: ['heroes'],
  deckHeroes: ['deckHeroes'],
  villains: ['villains'],
  henchmen: ['henchmen'],
  extras: ['bystanders'],
}

const SORT_LABELS: Record<SortMode, string> = {
  alpha: 'Alphabetical',
  set: 'Grouped by set',
  team: 'Grouped by team (heroes)',
}

// ---------- Dane do wyświetlenia ----------

/** Wspólny kształt kafelka: bohater, grupa villainów, grupa henchmenów albo mastermind. */
interface PickItem {
  id: string
  name: string
  icon?: string
  team?: string
  setId: string
  setName: string
}

interface Section {
  key: string
  title?: string
  icon?: string
  items: PickItem[]
}

interface Category {
  title: string
  items: PickItem[]
  selected: string[]
  max: number
  required: string[]
  single?: boolean // wybór jednej rzeczy: kliknięcie innego kafelka podmienia wybór
  onChange: (ids: string[]) => void
}

function groupItems(
  sets: SetData[],
  pick: (s: SetData) => CardGroup[],
  iconFolder: string,
  withTeam: boolean,
): PickItem[] {
  return sets.flatMap((s) =>
    pick(s).map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon ?? `${iconFolder}/${g.id}.png`,
      team: withTeam ? g.cards[0]?.card.team?.[0] : undefined,
      setId: s.id,
      setName: s.name,
    })),
  )
}

function mastermindItems(sets: SetData[]): PickItem[] {
  return sets.flatMap((s) =>
    s.masterminds.map((m) => ({
      id: m.card.id,
      name: m.card.name,
      icon: `icons/masterminds/${m.card.id}.png`,
      setId: s.id,
      setName: s.name,
    })),
  )
}

/** Dzieli widoczne kafelki na sekcje zależnie od sortowania (z nagłówkami albo bez). */
function buildSections(items: PickItem[], activeSets: SetData[], mode: SortMode, byTeam: boolean): Section[] {
  const byName = (a: PickItem, b: PickItem) => a.name.localeCompare(b.name, 'en')

  if (mode === 'set') {
    return activeSets
      .map((s) => ({
        key: s.id,
        title: s.name,
        icon: s.icon ?? `icons/sets/${s.id}.png`,
        items: items.filter((i) => i.setId === s.id).sort(byName),
      }))
      .filter((sec) => sec.items.length > 0)
  }

  if (mode === 'team' && byTeam) {
    const groups = new Map<string, PickItem[]>()
    for (const item of items) {
      const key = item.team ?? ''
      groups.set(key, [...(groups.get(key) ?? []), item])
    }
    return [...groups.entries()]
      .sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : teamName(a).localeCompare(teamName(b), 'en')))
      .map(([key, list]) => ({
        key: key || 'none',
        title: key ? teamName(key) : 'No team',
        icon: teamIcon(key || undefined),
        items: list.sort(byName),
      }))
  }

  return [{ key: 'all', items: [...items].sort(byName) }]
}

// ---------- Drobiazgi ----------

function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

function safely(action: () => void): void {
  try {
    action()
  } catch (e) {
    alert((e as Error).message)
  }
}

/** Losowy wybór: najpierw elementy wymagane, potem losowe, razem najwyżej `max`. */
function randomPick(items: PickItem[], required: string[], max: number): string[] {
  const pool = items.map((i) => i.id)
  const locked = required.filter((id) => pool.includes(id))
  const rest = pool.filter((id) => !locked.includes(id))
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[rest[i], rest[j]] = [rest[j], rest[i]]
  }
  return [...locked, ...rest].slice(0, max)
}

function iconSrc(path: string): string {
  return import.meta.env.BASE_URL + path
}

/** Mała ikonka, która znika, gdy pliku brakuje. */
function SmallIcon({ src, className }: { src?: string; className: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return null
  return <img className={className} src={iconSrc(src)} alt="" loading="lazy" onError={() => setFailed(true)} />
}

interface TileProps {
  name: string
  icon?: string
  team?: string
  checked: boolean
  disabled: boolean
  locked: boolean
  onToggle: () => void
}

function Tile({ name, icon, team, checked, disabled, locked, onToggle }: TileProps) {
  const [failed, setFailed] = useState(false)
  const classes = ['tile', checked ? 'checked' : '', locked ? 'locked' : ''].filter(Boolean).join(' ')
  return (
    <label className={classes} title={team ? `${name} (${teamName(team)})` : name}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onToggle} />
      <span className="tile-icon">
        {icon && !failed ? (
          <img src={iconSrc(icon)} alt="" loading="lazy" onError={() => setFailed(true)} />
        ) : (
          <span className="tile-fallback">{name.charAt(0)}</span>
        )}
      </span>
      {checked && <span className="tile-badge">{locked ? '🔒' : '✓'}</span>}
      <span className="tile-label">
        <SmallIcon src={teamIcon(team)} className="tile-team" />
        <span className="tile-name">{name}</span>
      </span>
    </label>
  )
}

// ---------- Menu ----------

export function SetupMenu({ sets, onStart }: SetupMenuProps) {
  const [enabledSetIds, setEnabledSetIds] = useState<string[]>(() => sets.map((s) => s.id))
  const [choices, setChoices] = useState<SetupChoices>(() => {
    const pending = consumePendingSetupChoices()
    const base = pending ? pruneChoices(pending, sets, GAME_MODES) : EMPTY_CHOICES
    return { ...base, gameModeId: base.gameModeId || GAME_MODES[0]?.id || '' }
  })
  const [historyOpen, setHistoryOpen] = useState(false)
  const [tabState, setTab] = useState<TabId>('mastermind')
  const [sortMode, setSortMode] = useState<SortMode>('alpha')
  const [query, setQuery] = useState('')
  const [teamFilter, setTeamFilter] = useState<string[]>([])
  const [selectedOnly, setSelectedOnly] = useState(false)

  // Pula do wyboru = suma zaznaczonych zestawów
  const activeSets = useMemo(() => sets.filter((s) => enabledSetIds.includes(s.id)), [sets, enabledSetIds])
  const items = useMemo<Record<CategoryId, PickItem[]>>(() => {
    const heroes = groupItems(activeSets, (s) => s.heroes, 'icons/heroes', true)
    return {
      mastermind: mastermindItems(activeSets),
      heroes,
      deckHeroes: heroes,
      villains: groupItems(activeSets, (s) => s.villainGroups, 'icons/villainGroups', false),
      henchmen: groupItems(activeSets, (s) => s.henchmenGroups, 'icons/henchmen', false),
      bystanders: groupItems(activeSets, (s) => s.bystanderGroups, 'icons/bystanders', false),
    }
  }, [activeSets])

  const gameMode = GAME_MODES.find((m) => m.id === choices.gameModeId)
  const scheme = activeSets.flatMap((s) => s.schemes).find((s) => s.id === choices.schemeId)
  const mastermind = activeSets.flatMap((s) => s.masterminds).find((m) => m.card.id === choices.mastermindId)
  const rules = gameMode && scheme ? resolveRules(gameMode, scheme, mastermind) : DEFAULT_SETUP_RULES

  // Zakładka "Villain Deck Heroes" pokazuje się tylko wtedy, gdy scheme tego wymaga,
  // a "Extras" tylko wtedy, gdy któryś aktywny zestaw dostarcza opcjonalne dodatki
  const hasExtras = items.bystanders.some((i) => !rules.requiredBystanderGroups.includes(i.id))
  const tabOrder = TAB_ORDER.filter(
    (id) => (id !== 'deckHeroes' || rules.villainDeckHeroes > 0) && (id !== 'extras' || hasExtras),
  )
  const tab: TabId = tabOrder.includes(tabState) ? tabState : 'mastermind'
  const isHeroTab = tab === 'heroes' || tab === 'deckHeroes'

  const problems: string[] = []
  if (!gameMode) problems.push('Select a game mode')
  if (!scheme) problems.push('Select a scheme')
  if (!mastermind) problems.push('Select a mastermind')
  problems.push(...getSetupProblems(choices, rules))

  function update(patch: Partial<SetupChoices>) {
    setChoices((current) => ({ ...current, ...patch }))
  }

  function toggleSet(id: string) {
    const next = enabledSetIds.includes(id)
      ? enabledSetIds.filter((x) => x !== id)
      : [...enabledSetIds, id]
    if (next.length === 0) return // musi zostać przynajmniej jeden zestaw
    setEnabledSetIds(next)
    setChoices(pruneChoices(choices, sets.filter((s) => next.includes(s.id)), GAME_MODES))
  }

  /** Zmiana schematu od razu wstawia wymaganych bohaterów talii złoczyńców (i zdejmuje ich ze zwykłych bohaterów). */
  function changeScheme(schemeId: string) {
    const next = activeSets.flatMap((s) => s.schemes).find((s) => s.id === schemeId)
    const nextRules = gameMode && next ? resolveRules(gameMode, next, mastermind) : DEFAULT_SETUP_RULES
    const forced = nextRules.requiredVillainDeckHeroes
    update({
      schemeId,
      villainDeckHeroIds: forced,
      heroIds: choices.heroIds.filter((id) => !forced.includes(id)),
    })
  }

  const categories: Record<CategoryId, Category> = {
    mastermind: {
      title: 'Mastermind',
      items: items.mastermind,
      selected: choices.mastermindId ? [choices.mastermindId] : [],
      max: 1,
      required: [],
      single: true,
      onChange: (ids) => {
        const id = ids[0] ?? ''
        const picked = activeSets.flatMap((s) => s.masterminds).find((m) => m.card.id === id)
        update({
          mastermindId: id,
          villainGroupIds: withLedGroup(choices.villainGroupIds, picked, rules.villainGroups),
        })
      },
    },
    heroes: {
      title: 'Heroes',
      items: items.heroes,
      selected: choices.heroIds,
      max: rules.heroes,
      required: rules.requiredHeroes,
      onChange: (heroIds) => update({ heroIds }),
    },
    deckHeroes: {
      title: 'Villain Deck Heroes',
      items: items.deckHeroes,
      selected: choices.villainDeckHeroIds,
      max: rules.villainDeckHeroes,
      required: rules.requiredVillainDeckHeroes,
      onChange: (villainDeckHeroIds) => update({ villainDeckHeroIds }),
    },
    villains: {
      title: 'Villain Groups',
      items: items.villains,
      selected: choices.villainGroupIds,
      max: rules.villainGroups,
      required: rules.requiredVillainGroups,
      onChange: (villainGroupIds) => update({ villainGroupIds }),
    },
    henchmen: {
      title: 'Henchmen',
      items: items.henchmen,
      selected: choices.henchmenGroupIds,
      max: rules.henchmenGroups,
      required: rules.requiredHenchmenGroups,
      onChange: (henchmenGroupIds) => update({ henchmenGroupIds }),
    },
    bystanders: {
      title: 'Bystanders',
      items: items.bystanders,
      // Wymagani (zwykli Bystanderzy z Core Setu) są zawsze zaznaczeni i zablokowani
      selected: withRequiredBystanderGroups(choices.bystanderGroupIds, rules).filter((id) =>
        items.bystanders.some((i) => i.id === id),
      ),
      max: items.bystanders.length, // bez limitu: można dobrać wszystkie dostępne
      required: rules.requiredBystanderGroups,
      onChange: (bystanderGroupIds) => update({ bystanderGroupIds }),
    },
  }
  const tabTitle = (id: TabId) => (id === 'extras' ? 'Extras' : categories[id].title)

  function toggleItem(c: Category, id: string) {
    if (c.single) {
      c.onChange(c.selected.includes(id) ? [] : [id])
    } else {
      c.onChange(toggleId(c.selected, id))
    }
  }

  function selectTab(next: TabId) {
    setTab(next)
    setQuery('')
    setSelectedOnly(false)
  }

  function clearFilters() {
    setQuery('')
    setTeamFilter([])
    setSelectedOnly(false)
  }

  // Drużyny bohaterów z aktywnych zestawów (do filtra); filtr ignoruje drużyny, których już nie ma
  const teams = useMemo(() => {
    const counts = new Map<string, number>()
    for (const i of items.heroes) if (i.team) counts.set(i.team, (counts.get(i.team) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => teamName(a[0]).localeCompare(teamName(b[0]), 'en'))
  }, [items.heroes])
  const activeTeamFilter = teamFilter.filter((t) => teams.some(([id]) => id === t))

  const q = query.trim().toLowerCase()
  // Kategorie bieżącej zakładki: każda z własnymi widocznymi kafelkami i sekcjami
  const panels = TAB_CATEGORIES[tab].map((id) => {
    const c = categories[id]
    // Bohater wybrany w jednej zakładce jest zablokowany w drugiej
    const blocked = id === 'heroes' ? choices.villainDeckHeroIds : id === 'deckHeroes' ? choices.heroIds : []
    const visible = c.items.filter((i) => {
      if (selectedOnly && !c.selected.includes(i.id)) return false
      if (isHeroTab && activeTeamFilter.length > 0 && !(i.team && activeTeamFilter.includes(i.team))) {
        return false
      }
      if (q && !`${i.name} ${i.team ? teamName(i.team) : ''}`.toLowerCase().includes(q)) return false
      return true
    })
    return { id, cat: c, blocked, visible, sections: buildSections(visible, activeSets, sortMode, isHeroTab) }
  })
  const visibleCount = panels.reduce((n, p) => n + p.visible.length, 0)
  const totalCount = panels.reduce((n, p) => n + p.cat.items.length, 0)

  // Losowanie tylko dla bieżącej zakładki (reszta wyborów zostaje), według limitów z tej zakładki.
  // Extras są opcjonalne, więc losuje się z nich losową liczbę (wymagane zawsze zostają).
  function rerollCurrent() {
    for (const p of panels) {
      const pool = p.cat.items.filter((i) => !p.blocked.includes(i.id))
      const lockedCount = p.cat.required.filter((id) => pool.some((i) => i.id === id)).length
      const count =
        tab === 'extras'
          ? lockedCount + Math.floor(Math.random() * (pool.length - lockedCount + 1))
          : p.cat.max
      p.cat.onChange(randomPick(pool, p.cat.required, count))
    }
  }

  // Podsumowanie wyborów (chipsy w stopce, z możliwością usunięcia)
  const chips = tabOrder
    .flatMap((t) => TAB_CATEGORIES[t])
    .flatMap((id) =>
      categories[id].selected.map((selectedId) => ({
        category: id,
        id: selectedId,
        name: categories[id].items.find((i) => i.id === selectedId)?.name ?? selectedId,
        locked: categories[id].required.includes(selectedId),
      })),
    )
    // Wymagane dodatki (zwykli Bystanderzy) to baza każdej gry, więc bez chipa
    .filter((c) => !(c.locked && TAB_CATEGORIES.extras.includes(c.category)))

  const namesOf = (id: CategoryId, ids: string[]) =>
    ids.map((x) => items[id].find((i) => i.id === x)?.name ?? x)

  function start() {
    if (!gameMode || !scheme || !mastermind) return
    const setup = buildSetup(choices, activeSets, GAME_MODES)
    const logMeta: GameLogMeta = {
      choices,
      gameModeName: gameMode.name,
      schemeName: scheme.name,
      mastermindName: mastermind.card.name,
      heroNames: namesOf('heroes', choices.heroIds),
      villainGroupNames: namesOf('villains', choices.villainGroupIds),
      henchmenGroupNames: namesOf('henchmen', choices.henchmenGroupIds),
    }
    onStart(setup, logMeta)
  }

  return (
    <div className="setup-menu">
      <header className="setup-header">
        <h1>Marvel Legendary</h1>
        <button onClick={() => setHistoryOpen(true)}>Game History</button>
      </header>

      <div className="setup-body">
        {/* ===== Lewa kolumna: zestawy i reguły ===== */}
        <aside className="setup-sidebar">
          <section className="setup-panel">
            <div className="setup-label-row">
              <div className="setup-label">Sets</div>
              {enabledSetIds.length < sets.length && (
                <button className="setup-link" onClick={() => setEnabledSetIds(sets.map((s) => s.id))}>
                  Enable all
                </button>
              )}
            </div>
            <div className="sets-list">
              {sets.map((set) => {
                const on = enabledSetIds.includes(set.id)
                return (
                  <label key={set.id} className={on ? 'set-row' : 'set-row off'}>
                    <input type="checkbox" checked={on} onChange={() => toggleSet(set.id)} />
                    <SmallIcon src={set.icon ?? `icons/sets/${set.id}.png`} className="set-row-icon" />
                    <span className="set-row-name">{set.name}</span>
                  </label>
                )
              })}
            </div>
          </section>

          <section className="setup-panel">
            <div className="setup-label">Game Mode</div>
            <select value={choices.gameModeId} onChange={(e) => update({ gameModeId: e.target.value })}>
              <option value="">— select —</option>
              {GAME_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <div className="setup-label setup-label-spaced">Scheme</div>
            <select value={choices.schemeId} onChange={(e) => changeScheme(e.target.value)}>
              <option value="">— select —</option>
              {activeSets.map(
                (s) =>
                  s.schemes.length > 0 && (
                    <optgroup key={s.id} label={s.name}>
                      {s.schemes.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.name}
                        </option>
                      ))}
                    </optgroup>
                  ),
              )}
            </select>
          </section>
        </aside>

        {/* ===== Prawa kolumna: zakładki z kafelkami ===== */}
        <div className="setup-main setup-panel">
          <div className="setup-main-head">
            <div className="setup-tabs" role="tablist">
              {tabOrder.map((id) => {
                const tabCats = TAB_CATEGORIES[id].map((cid) => categories[cid])
                const isExtras = id === 'extras'
                const done = !isExtras && tabCats.every((c) => c.selected.length === c.max)
                // Extras są opcjonalne: zamiast x/y pokazują tylko, ile dodatków wybrano ponad wymagane
                const extraCount = tabCats.reduce(
                  (n, c) => n + c.selected.filter((x) => !c.required.includes(x)).length,
                  0,
                )
                return (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={tab === id}
                    className={['setup-tab', tab === id ? 'active' : '', done ? 'done' : ''].filter(Boolean).join(' ')}
                    onClick={() => selectTab(id)}
                  >
                    {tabTitle(id)}
                    {isExtras ? (
                      extraCount > 0 && <span className="tab-count">+{extraCount}</span>
                    ) : (
                      <span className="tab-count">
                        {tabCats[0].selected.length}/{tabCats[0].max}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="setup-toolbar">
              <div className="search-box">
                <input
                  type="text"
                  value={query}
                  placeholder={`Search ${tabTitle(tab).toLowerCase()}…`}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
                />
                {query && (
                  <button className="search-clear" aria-label="Clear search" onClick={() => setQuery('')}>
                    ✕
                  </button>
                )}
              </div>

              <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} aria-label="Sort">
                {(Object.keys(SORT_LABELS) as SortMode[]).map((m) => (
                  <option key={m} value={m}>
                    {SORT_LABELS[m]}
                  </option>
                ))}
              </select>

              <button
                className={selectedOnly ? 'setup-pill on' : 'setup-pill'}
                onClick={() => setSelectedOnly(!selectedOnly)}
              >
                Selected only
              </button>
                            <button className="setup-pill" onClick={rerollCurrent} title={`Randomize ${tabTitle(tab)}`}>
                🎲 Random
              </button>

              <span className="setup-count">
                {visibleCount} of {totalCount}
              </span>
            </div>

            {isHeroTab && teams.length > 0 && (
              <div className="team-filters">
                {teams.map(([id, count]) => (
                  <button
                    key={id}
                    className={activeTeamFilter.includes(id) ? 'setup-pill on' : 'setup-pill'}
                    onClick={() => setTeamFilter(toggleId(activeTeamFilter, id))}
                  >
                    <SmallIcon src={teamIcon(id)} className="pill-icon" />
                    {teamName(id)} <span className="pill-count">{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="tile-scroll">
            {panels.map((p) => (
              <div key={p.id} className={tab === 'extras' ? 'extra-block' : undefined}>
                {tab === 'extras' && (
                  <h3 className="extra-title">
                    {p.cat.title}
                    <span className="tile-section-count">
                      {p.cat.selected.length}/{p.cat.items.length}
                    </span>
                  </h3>
                )}

                {p.sections.map((sec) => (
                  <div className="tile-section" key={sec.key}>
                    {sec.title && (
                      <div className="tile-section-title">
                        <SmallIcon src={sec.icon} className="tile-section-icon" />
                        <span>{sec.title}</span>
                        <span className="tile-section-count">{sec.items.length}</span>
                      </div>
                    )}
                    <div className="tile-grid">
                      {sec.items.map((item) => {
                        const checked = p.cat.selected.includes(item.id)
                        const locked = checked && p.cat.required.includes(item.id)
                        const full = !p.cat.single && p.cat.selected.length >= p.cat.max
                        return (
                          <Tile
                            key={item.id}
                            name={item.name}
                            icon={item.icon}
                            team={item.team}
                            checked={checked}
                            locked={locked}
                            disabled={locked || p.blocked.includes(item.id) || (!checked && full)}
                            onToggle={() => toggleItem(p.cat, item.id)}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}

                {p.visible.length === 0 && (
                  <div className="setup-empty">
                    {p.cat.items.length === 0 ? (
                      'Nothing available in the enabled sets.'
                    ) : (
                      <>
                        No matches.{' '}
                        <button className="setup-link" onClick={clearFilters}>
                          Clear filters
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Stopka: podsumowanie, problemy, akcje ===== */}
      <footer className="setup-footer setup-panel">
        <div className="setup-chips">
          {chips.length === 0 && <span className="setup-hint">Nothing selected yet</span>}
          {chips.map((c) => (
            <button
              key={`${c.category}:${c.id}`}
              className={`setup-chip chip-${c.category}`}
              disabled={c.locked}
              title={c.locked ? `${c.name} (required)` : `Remove ${c.name}`}
              onClick={() =>
                categories[c.category].onChange(categories[c.category].selected.filter((x) => x !== c.id))
              }
            >
              {c.name}
              <span className="chip-x">{c.locked ? '🔒' : '×'}</span>
            </button>
          ))}
        </div>

        {problems.length > 0 ? (
          <ul className="setup-problems">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : (
          <div className="setup-ready">Ready to start</div>
        )}

        <div className="setup-buttons">
          <button onClick={() => safely(() => setChoices(completeChoices({}, activeSets, GAME_MODES)))}>
            Randomize
          </button>
          <button onClick={() => safely(() => setChoices(completeChoices(choices, activeSets, GAME_MODES)))}>
            Randomize Missing
          </button>
          <button onClick={() => setChoices({ ...EMPTY_CHOICES, gameModeId: GAME_MODES[0]?.id ?? '' })}>
            Clear
          </button>
          {import.meta.env.DEV && (
            <button onClick={() => setChoices(pruneChoices(DEBUG_PRESET, activeSets, GAME_MODES))}>
              Preset debug
            </button>
          )}
          <button className="setup-start" disabled={problems.length > 0} onClick={() => safely(start)}>
            Start
          </button>
        </div>
      </footer>

      {historyOpen && (
        <GameHistoryMenu
          onClose={() => setHistoryOpen(false)}
          onApply={(applied) => {
            setChoices(pruneChoices(applied, activeSets, GAME_MODES))
            setHistoryOpen(false)
          }}
        />
      )}
    </div>
  )
}
