import { useState } from 'react'

interface LogPanelProps {
  log: string[]
}

export function LogPanel({ log }: LogPanelProps) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const visible = open || hovered

  return (
    <div
      className={`log-shell${visible ? ' log-shell-open' : ''}${open ? ' log-shell-clicked' : ''}`}
    >
      <button
        className="log-tab"
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setOpen((value) => !value)}
      >
        Game Log
      </button>

      <aside
        className={`log-drawer${visible ? ' log-drawer-open' : ''}`}
        aria-hidden={!visible}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="log-drawer-header">
          <h3>Game Log</h3>
          <button className="log-close-button" type="button" onClick={() => setOpen(false)}>Close</button>
        </div>
        <div className="log-list">
          {log.length === 0 ? (
            <div>No events yet.</div>
          ) : (
            [...log].reverse().map((line, i) => (
              <div key={`${line}-${i}`}>{line}</div>
            ))
          )}
        </div>
      </aside>
    </div>
  )
}
