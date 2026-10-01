import { useState } from 'react'
import type { CardGroup, GameSetup, SetData, SetupChoices } from '../engine/types'
import { buildSetup, getSetupProblems } from '../engine/buildSetup'
import { DEFAULT_SETUP_RULES, resolveRules } from '../engine/setupRules'
import { EMPTY_CHOICES, completeChoices, pruneChoices } from '../engine/setupChoices'
import { GAME_MODES } from '../data/gameModes'
import { DEBUG_PRESET } from '../data/sets/setup'
import './SetupMenu.css'

interface SetupMenuProps {
  sets: SetData[]
  onStart: (setup: GameSetup) => void
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
  const [choices, setChoices] = useState<SetupChoices>(() => ({
    ...EMPTY_CHOICES,
    gameModeId: GAME_MODES[0]?.id ?? '', // domyślnie Dark City - Advanced Solo
  }))

  // Pula do wyboru = suma zaznaczonych zestawów
  const activeSets = sets.filter((s) => enabledSetIds.includes(s.id))
  const schemes = activeSets.flatMap((s) => s.schemes)
  const masterminds = activeSets.flatMap((s) => s.masterminds)

  const gameMode = GAME_MODES.find((m) => m.id === choices.gameModeId)
  const scheme = schemes.find((s) => s.id === choices.schemeId)
  const rules = gameMode && scheme ? resolveRules(gameMode, scheme) : DEFAULT_SETUP_RULES

  const problems: string[] = []
  if (!gameMode) problems.push('Wybierz game mode')
  if (!scheme) problems.push('Wybierz scheme')
  if (!masterminds.some((m) => m.card.id === choices.mastermindId)) {
    problems.push('Wybierz masterminda')
  }
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

  return (
    <div className="setup-menu">
      <h1>Marvel Legendary</h1>
      <h2>Nowa gra</h2>

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
        items={activeSets.flatMap((s) => s.heroes)}
        selected={choices.heroIds}
        max={rules.heroes}
        required={rules.requiredHeroes}
        onChange={(heroIds) => update({ heroIds })}
      />
      <PickList
        title="Grupy villainów"
        items={activeSets.flatMap((s) => s.villainGroups)}
        selected={choices.villainGroupIds}
        max={rules.villainGroups}
        required={rules.requiredVillainGroups}
        onChange={(villainGroupIds) => update({ villainGroupIds })}
      />
      <PickList
        title="Grupy henchmenów"
        items={activeSets.flatMap((s) => s.henchmenGroups)}
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
        <button
          className="setup-start"
          disabled={problems.length > 0}
          onClick={() => safely(() => onStart(buildSetup(choices, activeSets, GAME_MODES)))}
        >
          Start
        </button>
      </div>
    </div>
  )
}