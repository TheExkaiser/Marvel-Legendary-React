import type { CardData } from '../engine/types'
import { CardView } from './CardView'

interface RescuePromptProps {
  message: string
  bystanderData: CardData
  onClose: () => void
}

export function RescuePrompt({ message, bystanderData, onClose }: RescuePromptProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content rescue-content">
        <h3>{message}</h3>
        <CardView data={bystanderData} />
        {bystanderData.text && <p className="rescue-effect">{bystanderData.text}</p>}
        <p className="dismiss-hint">Press anywhere to close</p>
      </div>
    </div>
  )
}
