import { useState } from 'react'
import type { GameState } from '../engine/types'
import type { UiAdapter } from '../engine/ui'
import { gainWound, rescueBystander, debugReplaceAllHeroesInHq, debugRemoveAllStartingCards } from '../engine/game'

interface DebugPanelProps {
  state: GameState
  act: (action: (state: GameState, ui: UiAdapter) => void | Promise<void>) => void
}

export function DebugPanel({ state, act }: DebugPanelProps) {
  const [attackAmount, setAttackAmount] = useState(500)
  const [recruitAmount, setRecruitAmount] = useState(500)

  return (
    <div className="debug">
      <strong>Debug</strong>

      <button onClick={() => act(gainWound)}>Gain Wound</button>
      <button onClick={() => act(rescueBystander)}>Rescue Bystander</button>
      <button onClick={() => act(debugReplaceAllHeroesInHq)}>Replace all heroes in HQ</button>
      <button onClick={() => act(debugRemoveAllStartingCards)}>KO starting cards</button> 

      <span className="debug-group">
        <input
          type="number"
          value={attackAmount}
          onChange={(e) => setAttackAmount(Number(e.target.value))}
        />
        <button onClick={() => act((s) => { s.attack += attackAmount })}>
          Add attacks
        </button>
      </span>

      <span className="debug-group">
        <input
          type="number"
          value={recruitAmount}
          onChange={(e) => setRecruitAmount(Number(e.target.value))}
        />
        <button onClick={() => act((s) => { s.recruit += recruitAmount })}>
          Add resources
        </button>
      </span>

      <details>
        <summary>Player Deck ({state.deck.length})</summary>
        <ul>
          {state.deck.map((c) => (
            <li key={c.instanceId}>{state.cards[c.cardId].name}</li>
          ))}
        </ul>
      </details>
    </div>
  )
}