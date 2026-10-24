import type { TextOption } from '../engine/ui'
import type { CardData } from '../engine/types'
import { CardView } from './CardView'

interface OptionPromptProps {
  options: TextOption[]
  prompt: string
  onChoose: (id: string) => void
  cardData?: CardData
}

export function OptionPrompt({ options, prompt, onChoose, cardData }: OptionPromptProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content option-prompt">
        {cardData && (
          <div className="option-prompt-card">
            <CardView data={cardData} />
          </div>
        )}
        <p className="option-prompt-text">{prompt}</p>
        <div className="option-prompt-options">
          {options.map((opt) => (
            <button key={opt.id} onClick={() => onChoose(opt.id)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
