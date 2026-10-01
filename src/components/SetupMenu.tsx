import { useState } from 'react'
import type { CardGroup, GameSetup, SetData, SetupChoices } from '../engine/types'
import { buildSetup, getSetupProblems } from '../engine/buildSetup'
import { DEFAULT_SETUP_RULES, resolveRules } from '../engine/setupRules'
import { EMPTY_CHOICES, completeChoices, pruneChoices } from '../engine/setupChoices'
import { GAME_MODES } from '../data/gameModes'
import { DEBUG_PRESET } from '../data/sets/setup'
import { consumePendingSetupChoices, type GameLogMeta } from '../gameLog'
import { GameHistoryMenu } from './GameHistoryMenu'
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

// ---------- Lista checkboxów z limitem ----------

interface PickListProps {
  title: string
  items: CardGroup[]
  selected: string[]
  max: number
  required: string[]
  onChange: (ids: string[]) => void
}

function PickList({ title, items, selected, max, required, onChange }: PickListProps) {
  const full = selected.length >= max
  return (
    <section>
      <h3>
        {title} ({selected.length}/{max})
      </h3>
      <div className="pick-list">
        {items.map((item) => {
          const checked = selected.includes(item.id)
          const locked = checked && required.includes(item.id)
          return (
            <label key={item.id} className={checked ? 'pick checked' : 'pick'}>
              <input
                type="checkbox"
                checked={checked}
                disabled={locked || (!checked && full)}
                onChange={() => onChange(toggleId(selected, item.id))}
              />
              {item.name}
            </label>
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

  // Pula do wyboru = suma zaznaczonych zestawów
  const activeSets = sets.filter((s) => enabledSetIds.includes(s.id))
  const schemes = activeSets.flatMap((s) => s.schemes)
  const masterminds = activeSets.flatMap((s) => s.masterminds)
  const heroGroups = activeSets.flatMap((s) => s.heroes)
  const villainGroups = activeSets.flatMap((s) => s.villainGroups)
  const henchmenGroups = activeSets.flatMap((s) => s.henchmenGroups)

  const gameMode = GAME_MODES.find((m) => m.id === choices.gameModeId)
  const scheme = schemes.find((s) => s.id === choices.schemeId)
  const mastermind = masterminds.find((m) => m.card.id === choices.mastermindId)
  const rules = gameMode && scheme ? resolveRules(gameMode, scheme) : DEFAULT_SETUP_RULES

  const problems: string[] = []
  if (!gameMode) problems.push('Wybierz game mode')
  if (!scheme) problems.push('Wybierz scheme')
  if (!mastermind) problems.push('Wybierz masterminda')
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
      <h1>Marvel Legendary</h1>
      <h2>Nowa gra</h2>

      <button onClick={() => setHistoryOpen(true)}>Game History</button>

      <section>
        <h3>Zestawy</h3>
        <div className="pick-list">
          {sets.map((set) => (
            <label key={set.id} className="pick">
              <input
                type="checkbox"
                checked={enabledSetIds.includes(set.id)}
                onChange={() => toggleSet(set.id)}
              />
              {set.name}
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3>Game Mode</h3>
        <select value={choices.gameModeId} onChange={(e) => update({ gameModeId: e.target.value })}>
          <option value="">— wybierz —</option>
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
          <option value="">— wybierz —</option>
          {schemes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h3>Mastermind</h3>
        <select
          value={choices.mastermindId}
          onChange={(e) => update({ mastermindId: e.target.value })}
        >
          <option value="">— wybierz —</option>
          {masterminds.map((m) => (
            <option key={m.card.id} value={m.card.id}>
              {m.card.name}
            </option>
          ))}
        </select>
      </section>

      <PickList
        title="Bohaterowie"
        items={heroGroups}
        selected={choices.heroIds}
        max={rules.heroes}
        required={rules.requiredHeroes}
        onChange={(heroIds) => update({ heroIds })}
      />
      <PickList
        title="Grupy villainów"
        items={villainGroups}
        selected={choices.villainGroupIds}
        max={rules.villainGroups}
        required={rules.requiredVillainGroups}
        onChange={(villainGroupIds) => update({ villainGroupIds })}
      />
      <PickList
        title="Grupy henchmenów"
        items={henchmenGroups}
        selected={choices.henchmenGroupIds}
        max={rules.henchmenGroups}
        required={rules.requiredHenchmenGroups}
        onChange={(henchmenGroupIds) => update({ henchmenGroupIds })}
      />

      {problems.length > 0 && (
        <ul className="setup-problems">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      <div className="setup-buttons">
        <button onClick={() => safely(() => setChoices(completeChoices({}, activeSets, GAME_MODES)))}>
          Losuj wszystko
        </button>
        <button onClick={() => safely(() => setChoices(completeChoices(choices, activeSets, GAME_MODES)))}>
          Dolosuj brakujące
        </button>
        <button onClick={() => setChoices({ ...EMPTY_CHOICES, gameModeId: GAME_MODES[0]?.id ?? '' })}>
          Wyczyść
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