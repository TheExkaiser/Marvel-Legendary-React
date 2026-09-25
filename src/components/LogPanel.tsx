import { useState } from 'react'

interface LogPanelProps {
  log: string[]
}

export function LogPanel({ log }: LogPanelProps) {
  const [open, setOpen] = useState(false)
  const last = log[log.length - 1] ?? '(brak zdarzeń)'

  return (
    <>
      <div className="log-bar" onClick={() => setOpen(true)}>
        📜 {last}
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content log-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Log zdarzeń</h3>
            <div className="log-list">
              {[...log].reverse().map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
            <button onClick={() => setOpen(false)}>Zamknij</button>
          </div>
        </div>
      )}
    </>
  )
}
