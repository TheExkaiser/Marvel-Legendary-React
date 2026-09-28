import { useState } from 'react'

interface HamburgerMenuProps {
  onMainMenu: () => void
  onRestart: () => void
  onSettings: () => void
}

export function HamburgerMenu({ onMainMenu, onRestart, onSettings }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="hamburger-wrap">
      <button className="hamburger-button" onClick={() => setOpen((o) => !o)}>
        ☰
      </button>
      {open && (
        <div className="hamburger-menu">
          <button
            onClick={() => {
              setOpen(false)
              onSettings()
            }}
          >
            Settings
          </button>
          <button
            onClick={() => {
              setOpen(false)
              onMainMenu()
            }}
          >
            Main Menu
          </button>
          <button
            onClick={() => {
              setOpen(false)
              onRestart()
            }}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  )
}