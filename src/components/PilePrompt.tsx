import type { CardData } from '../engine/types'
import { CardView } from './CardView'

interface PilePromptProps {
  title: string
  cards: { instanceId: string; cardId: string }[]
  cardsById: Record<string, CardData>
  onClose: () => void
}

export function PilePrompt({ title, cards, cardsById, onClose }: PilePromptProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>
          {title} ({cards.length})
        </h3>
        <button className="close-button" onClick={onClose}>✕</button>
        {cards.length === 0 ? (
          <p>Pusto.</p>
        ) : (
          <div className="pile-grid">
            {cards.map((c) => (
              <CardView key={c.instanceId} data={cardsById[c.cardId]} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}