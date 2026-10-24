import type { CardInstance, GameState } from '../engine/types'
import { CardView } from './CardView'

interface CaptivesPromptProps {
  state: GameState
  captives: CardInstance[]
  onClose: () => void
}

export function CaptivesPrompt({ state, captives, onClose }: CaptivesPromptProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content">
        <h3>Captured Bystanders ({captives.length})</h3>
        <div className="row">
          {captives.map((c) => (
            <CardView key={c.instanceId} data={state.cards[c.cardId]} />
          ))}
        </div>
        <p className="dismiss-hint">Press anywhere to close</p>
      </div>
    </div>
  )
}
