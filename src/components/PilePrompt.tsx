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
      <div className="modal-content">
        <h3>
          {title} ({cards.length})
        </h3>
        {cards.length === 0 ? (
          <p>Empty.</p>
        ) : (
          <div className="pile-grid">
            {cards.map((c) => (
              <CardView key={c.instanceId} data={cardsById[c.cardId]} />
            ))}
          </div>
        )}
        <p className="dismiss-hint">Press anywhere to close</p>
      </div>
    </div>
  )
}
