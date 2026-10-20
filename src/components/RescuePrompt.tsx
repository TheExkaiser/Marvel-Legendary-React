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
      <div className="modal-content rescue-content" onClick={(e) => e.stopPropagation()}>
        <h3>{message}</h3>
        <button className="close-button" onClick={onClose}>✕</button>
        <CardView data={bystanderData} />
        {bystanderData.text && <p className="rescue-effect">{bystanderData.text}</p>}
      </div>
    </div>
  )
}
