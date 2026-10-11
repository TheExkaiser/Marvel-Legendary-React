import type { CardData, CardInstance } from '../engine/types'

interface StackedMasterStrikesProps {
  cards: CardInstance[]
  cardIndex: Record<string, CardData>
  onZoom?: (card: CardInstance) => void
}

/** Stos Master Strike'ów obok mastermina (Stryfe). Nic nie renderuje, gdy stos jest pusty. */
export function StackedMasterStrikes({ cards, cardIndex, onZoom }: StackedMasterStrikesProps) {
  if (cards.length === 0) return null

  const top = cards[cards.length - 1]
  const data = cardIndex[top.cardId]

  return (
    <div className="stacked-strikes" title={`Master Strikes stacked next to Stryfe: ${cards.length}`}>
      <div className="stacked-strikes-pile" onClick={() => onZoom?.(top)}>
        {cards.slice(-3).map((c, i) => (
          <img
            key={c.instanceId}
            src={cardIndex[c.cardId].img}
            alt={data.name}
            className="stacked-strikes-card"
            style={{ left: i * 4, top: i * 4 }}
          />
        ))}
      </div>
      <span className="stacked-strikes-badge">+{cards.length} Attack</span>
    </div>
  )
}