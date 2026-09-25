import { useState } from 'react'

interface HamburgerMenuProps {
  onMainMenu: () => void
  onRestart: () => void
}

export function HamburgerMenu({ onMainMenu, onRestart }: HamburgerMenuProps) {
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
