import { useState } from 'react'

interface NumberPromptProps {
  prompt: string
  initial: number
  min: number
  max: number
  onConfirm: (value: number) => void
}

export function NumberPrompt({ prompt, initial, min, max, onConfirm }: NumberPromptProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  const [value, setValue] = useState(clamp(initial))

  return (
    <div className="modal-overlay">
      <div className="modal-content number-prompt">
        <h3>{prompt}</h3>

        <div className="number-row">
          <button onClick={() => setValue(clamp(value - 1))} disabled={value <= min}>
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={value}
            autoFocus
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10)
              setValue(Number.isNaN(n) ? min : clamp(n))
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirm(value)
            }}
          />
          <button onClick={() => setValue(clamp(value + 1))} disabled={value >= max}>
            +
          </button>
        </div>

        <button className="number-confirm" onClick={() => onConfirm(value)}>
          OK
        </button>
      </div>
    </div>
  )
}