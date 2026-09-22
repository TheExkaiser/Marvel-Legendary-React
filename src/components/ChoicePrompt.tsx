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
  // Rozdzielamy opcje po tym, gdzie faktycznie leżą w stanie gry
  const handOptions = options.filter((o) => state.hand.includes(o))
  const discardOptions = options.filter((o) => state.discard.includes(o))
  const otherOptions = options.filter(
    (o) => !handOptions.includes(o) && !discardOptions.includes(o),
  )

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{prompt}</p>

        {handOptions.length > 0 && (
          <>
            <strong>Ręka</strong>
            <div className="row">
              {handOptions.map((c) => (
                <CardView key={c.instanceId} data={state.cards[c.cardId]} onClick={() => onChoose(c)} />
              ))}
            </div>
          </>
        )}

        {discardOptions.length > 0 && (
          <>
            <strong>Stos odrzuconych</strong>
            <div className="row">
              {discardOptions.map((c) => (
                <CardView key={c.instanceId} data={state.cards[c.cardId]} onClick={() => onChoose(c)} />
              ))}
            </div>
          </>
        )}

        {otherOptions.length > 0 && (
          <div className="row">
            {otherOptions.map((c) => (
              <CardView key={c.instanceId} data={state.cards[c.cardId]} onClick={() => onChoose(c)} />
            ))}
          </div>
        )}

        {optional && <button onClick={() => onChoose(null)}>Nic nie rób</button>}
      </div>
    </div>
  )
}