import { useState } from 'react'
import type { SetupChoices } from '../engine/types'
import { loadGameLog, exportGameLog, savePendingSetupChoices } from '../gameLog'
import type { GameLogEntry } from '../gameLog'
import { useMediaQuery } from '../useMediaQuery'

interface GameHistoryMenuProps {
  onClose: () => void
  // Gdy podane: klik "Add To Next Setup" od razu aplikuje wybory do aktualnie otwartego SetupMenu
  // i zamyka historię. Gdy brak: wybory lądują w localStorage do odczytu przy następnym wejściu w SetupMenu.
  onApply?: (choices: SetupChoices) => void
}

const resultText = (entry: GameLogEntry) => (entry.result === 'Lose' ? 'Lose' : `${entry.result} VP`)

export function GameHistoryMenu({ onClose, onApply }: GameHistoryMenuProps) {
  const log = loadGameLog()
  const [addedId, setAddedId] = useState<string | null>(null)
  // Telefon (poziomo lub wąski ekran): karty zamiast szerokiej tabeli
  const compact = useMediaQuery('(max-height: 500px), (max-width: 700px)')

  function handleAddToNextSetup(entryId: string, choices: SetupChoices) {
    if (onApply) {
      onApply(choices)
      return
    }
    savePendingSetupChoices(choices)
    setAddedId(entryId)
  }

  const addLabel = (entry: GameLogEntry) => (addedId === entry.id ? 'Added ✓' : 'Add To Next Setup')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={compact ? 'modal-content history-content history-content-compact' : 'modal-content history-content'}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Game History</h3>
        <button className="close-button" onClick={onClose}>✕</button>

        <div className="history-actions">
          <button onClick={() => exportGameLog(log)} disabled={log.length === 0}>
            Export (JSON)
          </button>
        </div>

        {log.length === 0 ? (
          <p>No completed games yet.</p>
        ) : compact ? (
          <ul className="history-list">
            {log.map((entry) => (
              <li key={entry.id} className="history-card">
                <div className="history-card-head">
                  <span>{entry.date} {entry.time}</span>
                  <span className={entry.result === 'Lose' ? 'history-card-result lose' : 'history-card-result win'}>
                    {resultText(entry)}
                  </span>
                </div>
                <div className="history-card-title">{entry.mastermindName}</div>
                <div className="history-card-sub">{entry.schemeName} · {entry.gameModeName}</div>
                <dl className="history-card-lines">
                  <dt>Heroes</dt>
                  <dd>{entry.heroNames.join(', ')}</dd>
                  {entry.villainGroupNames.length > 0 && (
                    <>
                      <dt>Villains</dt>
                      <dd>{entry.villainGroupNames.join(', ')}</dd>
                    </>
                  )}
                  {entry.henchmenGroupNames.length > 0 && (
                    <>
                      <dt>Henchmen</dt>
                      <dd>{entry.henchmenGroupNames.join(', ')}</dd>
                    </>
                  )}
                </dl>
                <button onClick={() => handleAddToNextSetup(entry.id, entry.choices)}>{addLabel(entry)}</button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Game Mode</th>
                  <th>Scheme</th>
                  <th>Mastermind</th>
                  <th>Heroes</th>
                  <th>Villains</th>
                  <th>Henchmen</th>
                  <th>Result</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {log.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.date}</td>
                    <td>{entry.time}</td>
                    <td>{entry.gameModeName}</td>
                    <td>{entry.schemeName}</td>
                    <td>{entry.mastermindName}</td>
                    <td>{entry.heroNames.join(', ')}</td>
                    <td>{entry.villainGroupNames.join(', ')}</td>
                    <td>{entry.henchmenGroupNames.join(', ')}</td>
                    <td>{resultText(entry)}</td>
                    <td>
                      <button onClick={() => handleAddToNextSetup(entry.id, entry.choices)}>{addLabel(entry)}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
