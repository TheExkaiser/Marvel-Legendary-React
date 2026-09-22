import type { TextOption } from '../engine/ui'

interface OptionPromptProps {
  options: TextOption[]
  prompt: string
  onChoose: (id: string) => void
}

export function OptionPrompt({ options, prompt, onChoose }: OptionPromptProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{prompt}</p>
        <div className="debug">
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