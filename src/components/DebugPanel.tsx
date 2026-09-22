import { useState } from 'react'
import type { GameState } from '../engine/types'
import type { UiAdapter } from '../engine/ui'
import { gainWound, rescueBystander } from '../engine/game'

interface DebugPanelProps {
  act: (action: (state: GameState, ui: UiAdapter) => void | Promise<void>) => void
}

export function DebugPanel({ act }: DebugPanelProps) {
  const [attackAmount, setAttackAmount] = useState(1)
  const [recruitAmount, setRecruitAmount] = useState(1)

  return (
    <div className="debug">
      <strong>Debug</strong>

      <button onClick={() => act(gainWound)}>Test: zdobądź ranę</button>
      <button onClick={() => act(rescueBystander)}>Test: uratuj bystandera</button>

      <span className="debug-group">
        <input
          type="number"
          value={attackAmount}
          onChange={(e) => setAttackAmount(Number(e.target.value))}
        />
        <button onClick={() => act((s) => { s.attack += attackAmount })}>
          Test: dodaj attack
        </button>
      </span>

      <span className="debug-group">
        <input
          type="number"
          value={recruitAmount}
          onChange={(e) => setRecruitAmount(Number(e.target.value))}
        />
        <button onClick={() => act((s) => { s.recruit += recruitAmount })}>
          Test: dodaj recruit
        </button>
      </span>
    </div>
  )
}