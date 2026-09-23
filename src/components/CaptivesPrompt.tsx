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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Przetrzymywani Bystanderzy ({captives.length})</h3>
        <div className="row">
          {captives.map((c) => (
            <CardView key={c.instanceId} data={state.cards[c.cardId]} />
          ))}
        </div>
        <button onClick={onClose}>Zamknij</button>
      </div>
    </div>
  )
}