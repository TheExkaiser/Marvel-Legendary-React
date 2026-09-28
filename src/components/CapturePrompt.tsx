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
      <div className="modal-content capture-content" onClick={(e) => e.stopPropagation()}>
        <h3>{message}</h3>
        <button className="close-button" onClick={onClose}>✕</button>
        <div className="capture-body">
          <CardView data={bystanderData} />
          <span className="capture-arrow">→</span>
          <CardView data={capturerData} />
        </div>
      </div>
    </div>
  )
}