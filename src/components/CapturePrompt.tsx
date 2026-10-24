import type { CardData } from '../engine/types'
import { CardView } from './CardView'

interface CapturePromptProps {
  message: string
  capturerData: CardData
  bystanderData: CardData
  onClose: () => void
}

export function CapturePrompt({ message, capturerData, bystanderData, onClose }: CapturePromptProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content capture-content">
        <h3>{message}</h3>
        <div className="capture-body">
          <CardView data={bystanderData} />
          <span className="capture-arrow">→</span>
          <CardView data={capturerData} />
        </div>
        <p className="dismiss-hint">Press anywhere to close</p>
      </div>
    </div>
  )
}
