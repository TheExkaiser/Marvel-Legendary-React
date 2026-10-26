import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ZoomModalProps {
  title: string
  onClose: () => void
  image?: ReactNode // obrazek po lewej, powinien mieć klasę zoom-image
  className?: string // modyfikator układu, np. 'zoom-scheme'
  children?: ReactNode // treść w kolumnie po prawej, od góry, pod tytułem
}

// Wspólna powłoka okna podglądu: karta (CardView) i scheme (StatsPanel) podają tylko swoją treść.
// Układ (też mobilny) jest w ZoomModal.css. Kliknięcie w dowolne miejsce zamyka okno.
export function ZoomModal({ title, onClose, image, className, children }: ZoomModalProps) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className={['modal-content', 'zoom-content', className].filter(Boolean).join(' ')}>
        <h3>{title}</h3>
        <div className="zoom-body">
          {image}
          <div className="zoom-details">{children}</div>
        </div>
        <p className="dismiss-hint">Press anywhere to close</p>
      </div>
    </div>,
    document.body,
  )
}
