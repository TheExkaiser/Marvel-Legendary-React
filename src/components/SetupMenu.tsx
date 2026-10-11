import { useState } from 'react'
import type { CardGroup, GameSetup, MastermindData, SetData, SetupChoices } from '../engine/types'
import { buildSetup, getSetupProblems } from '../engine/buildSetup'
import { DEFAULT_SETUP_RULES, resolveRules } from '../engine/setupRules'
import { EMPTY_CHOICES, completeChoices, pruneChoices } from '../engine/setupChoices'
import { GAME_MODES } from '../data/gameModes'
import { DEBUG_PRESET } from '../data/sets/setup'
import { consumePendingSetupChoices, type GameLogMeta } from '../gameLog'
import { GameHistoryMenu } from './GameHistoryMenu'
import { teamIcon } from '../data/teams'
import './SetupMenu.css'

interface SetupMenuProps {
  sets: SetData[]
  onStart: (setup: GameSetup, logMeta: GameLogMeta) => void
}

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

function byName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'en'))
}

type SortMode = 'alpha' | 'set' | 'team'

function groupTeam(g: CardGroup): string | undefined {
  return g.cards[0]?.card.team?.[0]
}

function sortGroups(sets: SetData[], pick: (s: SetData) => CardGroup[], mode: SortMode): CardGroup[] {
  if (mode === 'set') return sets.flatMap((s) => byName(pick(s))) // kolejność setów z tablicy `sets`
  const all = sets.flatMap(pick)
  if (mode === 'team') {
    return [...all].sort(
      (a, b) =>
        (groupTeam(a) ?? '').localeCompare(groupTeam(b) ?? '', 'en') ||
        a.name.localeCompare(b.name, 'en'),
    )
  }
  return byName(all)
}

function sortMasterminds(sets: SetData[], mode: SortMode): MastermindData[] {
  const byCardName = (a: MastermindData, b: MastermindData) =>
    a.card.name.localeCompare(b.card.name, 'en')
  if (mode === 'set') return sets.flatMap((s) => [...s.masterminds].sort(byCardName))
  return sets.flatMap((s) => s.masterminds).sort(byCardName) // alpha i team: alfabetycznie
}

function iconSrc(path: string): string {
  return import.meta.env.BASE_URL + path
}

interface IconTileProps {
  name: string
  icon?: string
  teamIcon?: string
  checked: boolean
  disabled?: boolean
  onToggle: () => void
}

function IconTile({ name, icon, teamIcon, checked, disabled, onToggle }: IconTileProps) {
  const [failed, setFailed] = useState(false)
  return (
    <label className={checked ? 'tile checked' : 'tile'} title={name}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onToggle} />
      <span className="tile-icon">
        {icon && !failed ? (
          <img src={iconSrc(icon)} alt="" loading="lazy" onError={() => setFailed(true)} />
        ) : (
          <span className="tile-fallback">{name.charAt(0)}</span>
        )}
      </span>
      <span className="tile-label">
        {teamIcon && (
          <img className="tile-team" src={iconSrc(teamIcon)} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
        )}
        <span className="tile-name">{name}</span>
      </span>
    </label>
  )
}

// ---------- Lista checkboxów z limitem ----------

interface PickListProps {
  title: string
  iconFolder: string
  items: CardGroup[]
  selected: string[]
  max: number
  required: string[]
  onChange: (ids: string[]) => void
}

function PickList({ title, iconFolder, items, selected, max, required, onChange }: PickListProps) {
  const full = selected.length >= max
  return (
    <section>
      <h3>
        {title} ({selected.length}/{max})
      </h3>
      <div className="tile-grid">
        {items.map((item) => {
          const checked = selected.includes(item.id)
          const locked = checked && required.includes(item.id)
          return (
            <IconTile
              key={item.id}
              name={item.name}
              icon={item.icon ?? `${iconFolder}/${item.id}.png`}
              teamIcon={teamIcon(groupTeam(item))}
              checked={checked}
              disabled={locked || (!checked && full)}
              onToggle={() => onChange(toggleId(selected, item.id))}
            />
          )
        })}
      </div>
    </section>
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
  const [sortMode, setSortMode] = useState<SortMode>('alpha')

  // Pula do wyboru = suma zaznaczonych zestawów
  const activeSets = sets.filter((s) => enabledSetIds.includes(s.id))
  const schemes = activeSets.flatMap((s) => s.schemes)
  const masterminds = sortMasterminds(activeSets, sortMode)
  const nonTeamMode: SortMode = sortMode === 'team' ? 'alpha' : sortMode
  const heroGroups = sortGroups(activeSets, (s) => s.heroes, sortMode)
  const villainGroups = sortGroups(activeSets, (s) => s.villainGroups, nonTeamMode)
  const henchmenGroups = sortGroups(activeSets, (s) => s.henchmenGroups, nonTeamMode)

  const gameMode = GAME_MODES.find((m) => m.id === choices.gameModeId)
  const scheme = schemes.find((s) => s.id === choices.schemeId)
  const mastermind = masterminds.find((m) => m.card.id === choices.mastermindId)
  const rules = gameMode && scheme ? resolveRules(gameMode, scheme) : DEFAULT_SETUP_RULES

  const problems: string[] = []
  if (!gameMode) problems.push('Select a game mode')
  if (!scheme) problems.push('Select a scheme')
  if (!mastermind) problems.push('Select a mastermind')
  problems.push(...getSetupProblems(choices, rules))

  function update(patch: Partial<SetupChoices>) {
    setChoices({ ...choices, ...patch })
  }

  function toggleSet(id: string) {
    const next = enabledSetIds.includes(id)
      ? enabledSetIds.filter((x) => x !== id)
      : [...enabledSetIds, id]
    if (next.length === 0) return // musi zostać przynajmniej jeden zestaw
    setEnabledSetIds(next)
    setChoices(pruneChoices(choices, sets.filter((s) => next.includes(s.id)), GAME_MODES))
  }

  function start() {
    if (!gameMode || !scheme || !mastermind) return
    const setup = buildSetup(choices, activeSets, GAME_MODES)
    const logMeta: GameLogMeta = {
      choices,
      gameModeName: gameMode.name,
      schemeName: scheme.name,
      mastermindName: mastermind.card.name,
      heroNames: heroGroups.filter((g) => choices.heroIds.includes(g.id)).map((g) => g.name),
      villainGroupNames: villainGroups
        .filter((g) => choices.villainGroupIds.includes(g.id))
        .map((g) => g.name),
      henchmenGroupNames: henchmenGroups
        .filter((g) => choices.henchmenGroupIds.includes(g.id))
        .map((g) => g.name),
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
        <div className="setup-col setup-left">
          <section>
            <h3>Sets</h3>
            <div className="tile-grid">
              {sets.map((set) => (
                <IconTile
                  key={set.id}
                  name={set.name}
                  icon={set.icon ?? `icons/sets/${set.id}.png`}
                  checked={enabledSetIds.includes(set.id)}
                  onToggle={() => toggleSet(set.id)}
                />
              ))}
            </div>
          </section>

          <section>
            <h3>Sort by</h3>
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
              <option value="alpha">Alphabetical</option>
              <option value="set">Set order + alphabetical</option>
              <option value="team">Team + alphabetical</option>
            </select>
          </section>

          <section>
            <h3>Game Mode</h3>
            <select value={choices.gameModeId} onChange={(e) => update({ gameModeId: e.target.value })}>
              <option value="">— select —</option>
              {GAME_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </section>

          <section>
            <h3>Scheme</h3>
            <select value={choices.schemeId} onChange={(e) => update({ schemeId: e.target.value })}>
              <option value="">— select —</option>
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </section>
        </div>

        <div className="setup-col setup-right">
          <section>
            <h3>Mastermind</h3>
            <div className="tile-grid">
              {masterminds.map((m) => (
                <IconTile
                  key={m.card.id}
                  name={m.card.name}
                  icon={`icons/masterminds/${m.card.id}.png`}
                  checked={choices.mastermindId === m.card.id}
                  onToggle={() =>
                    update({ mastermindId: choices.mastermindId === m.card.id ? '' : m.card.id })
                  }
                />
              ))}
            </div>
          </section>

          <PickList
            title="Heroes"
            items={heroGroups}
            iconFolder="icons/heroes"
            selected={choices.heroIds}
            max={rules.heroes}
            required={rules.requiredHeroes}
            onChange={(heroIds) => update({ heroIds })}
          />
          <PickList
            title="Villain Groups"
            items={villainGroups}
            iconFolder="icons/villainGroups"
            selected={choices.villainGroupIds}
            max={rules.villainGroups}
            required={rules.requiredVillainGroups}
            onChange={(villainGroupIds) => update({ villainGroupIds })}
          />
          <PickList
            title="Henchmen"
            items={henchmenGroups}
            iconFolder="icons/henchmen"
            selected={choices.henchmenGroupIds}
            max={rules.henchmenGroups}
            required={rules.requiredHenchmenGroups}
            onChange={(henchmenGroupIds) => update({ henchmenGroupIds })}
          />
        </div>
      </div>

      <footer className="setup-footer">
        {problems.length > 0 && (
          <ul className="setup-problems">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
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
          onApply={(choices) => {
            setChoices(pruneChoices(choices, activeSets, GAME_MODES))
            setHistoryOpen(false)
          }}
        />
      )}
    </div>
  )
}
