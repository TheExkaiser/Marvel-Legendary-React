import type { CardInstance, GameState } from '../engine/types'

interface TacticPromptProps {
  state: GameState
  card: CardInstance
  onClose: () => void
}

export function TacticPrompt({ state, card, onClose }: TacticPromptProps) {
  const data = state.cards[card.cardId]

  return (
    <div className="modal-overlay">
      <div className="modal-content zoom-content">
        <h3>{data.name}</h3>
        <div className="zoom-body">
          {data.img && <img src={data.img} alt={data.name} className="zoom-image" />}
          <div className="zoom-details">
            {data.text && <p>{data.text}</p>}
          </div>
        </div>
        <button onClick={onClose}>Zamknij</button>
      </div>
    </div>
  )
}