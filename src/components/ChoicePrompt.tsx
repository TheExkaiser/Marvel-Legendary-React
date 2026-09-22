import type { CardInstance, GameState } from '../engine/types'
import { CardView } from './CardView'

interface ChoicePromptProps {
  state: GameState
  options: CardInstance[]
  prompt: string
  optional: boolean
  onChoose: (choice: CardInstance | null) => void
}

export function ChoicePrompt({ state, options, prompt, optional, onChoose }: ChoicePromptProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{prompt}</p>
        <div className="row">
          {options.map((c) => (
            <CardView key={c.instanceId} data={state.cards[c.cardId]} onClick={() => onChoose(c)} />
          ))}
        </div>
        {optional && <button onClick={() => onChoose(null)}>Nic nie rób</button>}
      </div>
    </div>
  )
}