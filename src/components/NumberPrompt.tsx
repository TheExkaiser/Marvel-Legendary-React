import { useEffect, useState } from 'react'

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

  // Enter zatwierdza wybór, niezależnie od tego, co ma fokus
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') onConfirm(value)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [value, onConfirm])

  return (
    <div className="modal-overlay">
      <div className="modal-content number-prompt">
        <h3>{prompt}</h3>

        <div className="number-row">
          <button onClick={() => setValue(clamp(value - 1))} disabled={value <= min}>
            −
          </button>
          {/* type="text" + inputMode: numeryczna klawiatura na telefonie, ale bez strzałek (suwaka) przeglądarki */}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '')
              setValue(digits === '' ? min : clamp(parseInt(digits, 10)))
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
