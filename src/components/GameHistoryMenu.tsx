import { useState } from 'react'
import type { SetupChoices } from '../engine/types'
import { loadGameLog, exportGameLog, savePendingSetupChoices } from '../gameLog'

interface GameHistoryMenuProps {
  onClose: () => void
  // Gdy podane: klik "Add To Next Setup" od razu aplikuje wybory do aktualnie otwartego SetupMenu
  // i zamyka historię. Gdy brak: wybory lądują w localStorage do odczytu przy następnym wejściu w SetupMenu.
  onApply?: (choices: SetupChoices) => void
}

export function GameHistoryMenu({ onClose, onApply }: GameHistoryMenuProps) {
  const log = loadGameLog()
  const [addedId, setAddedId] = useState<string | null>(null)

  function handleAddToNextSetup(entryId: string, choices: SetupChoices) {
    if (onApply) {
      onApply(choices)
      return
    }
    savePendingSetupChoices(choices)
    setAddedId(entryId)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content history-content" onClick={(e) => e.stopPropagation()}>
        <h3>Game History</h3>
        <button className="close-button" onClick={onClose}>✕</button>

        <div className="history-actions">
          <button onClick={() => exportGameLog(log)} disabled={log.length === 0}>
            Export (JSON)
          </button>
        </div>

        {log.length === 0 ? (
          <p>No completed games yet.</p>
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
                    <td>{entry.result === 'Lose' ? 'Lose' : `${entry.result} VP`}</td>
                    <td>
                      <button onClick={() => handleAddToNextSetup(entry.id, entry.choices)}>
                        {addedId === entry.id ? 'Added ✓' : 'Add To Next Setup'}
                      </button>
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