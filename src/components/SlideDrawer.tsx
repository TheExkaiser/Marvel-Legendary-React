import { useState } from 'react'
import type { ReactNode } from 'react'

interface SlideDrawerProps {
  edge: 'left' | 'right'
  tabLabel: string
  children: ReactNode
}

/**
 * Wysuwany panel przyklejony do krawędzi ekranu — otwiera się po najechaniu myszką.
 * Zakładka i panel razem tworzą ciągły obszar (oba przyklejone do tej samej krawędzi),
 * więc przejście myszką między nimi nie "gubi" hovera.
 */
export function SlideDrawer({ edge, tabLabel, children }: SlideDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className={`drawer-tab drawer-tab-${edge}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {tabLabel}
      </div>
      <div
        className={`drawer-panel drawer-panel-${edge}${open ? ' drawer-panel-open' : ''}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </div>
    </>
  )
}
