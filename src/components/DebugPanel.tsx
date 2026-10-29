import { useState } from 'react'
import type { GameState } from '../engine/types'
import type { UiAdapter } from '../engine/ui'
import './DebugPanel.css'
import {
  gainWound,
  rescueBystander,
  debugReplaceAllHeroesInHq,
  debugRemoveAllStartingCards,
  debugDrawVillainCard,
  debugPlayNextMasterStrike,
  debugPlayNextSchemeTwist,
  debugKoAllHeroesFromHq,
  debugEscapeAllVillainsFromCity,
  debugMoveAllVillainsToLeft,
  debugDrawCard,
  addAttack,
  addRecruit,
} from '../engine/game'

interface DebugPanelProps {
  state: GameState
  act: (action: (state: GameState, ui: UiAdapter) => void | Promise<void>) => void
}

export function DebugPanel({ state, act }: DebugPanelProps) {
  const [attackAmount, setAttackAmount] = useState(500)
  const [recruitAmount, setRecruitAmount] = useState(500)
  const masterStrikesRemaining = state.villainDeck.filter(
    (card) => state.cards[card.cardId].kind === 'masterstrike',
  ).length
  const schemeTwistsRemaining = state.villainDeck.filter(
    (card) => state.cards[card.cardId].kind === 'twist',
  ).length

  return (
    <div className="debug">
      <h3>Debug Tools</h3>

      <section className="debug-section">
        <h4>Game state</h4>
        <div className="debug-actions">
          <button onClick={() => act((s) => { s.status = 'won' })}>Instant Win</button>
          <button onClick={() => act((s) => { s.status = 'lost' })}>Instant Lose</button>
        </div>
      </section>

      <section className="debug-section">
        <h4>Villain deck &amp; city</h4>
        <div className="debug-actions">
          <button onClick={() => act(debugDrawVillainCard)}>Draw Villain Card</button>
          <button
            disabled={masterStrikesRemaining === 0}
            onClick={() => act(debugPlayNextMasterStrike)}
          >
            Master Strike ({masterStrikesRemaining})
          </button>
          <button
            disabled={schemeTwistsRemaining === 0}
            onClick={() => act(debugPlayNextSchemeTwist)}
          >
            Scheme Twist ({schemeTwistsRemaining})
          </button>
          <button onClick={() => act(debugMoveAllVillainsToLeft)}>Move all villains to the left</button>
          <button onClick={() => act(debugEscapeAllVillainsFromCity)}>Escape all Villains</button>
        </div>
      </section>

      <section className="debug-section">
        <h4>HQ</h4>
        <div className="debug-actions">
          <button onClick={() => act(debugReplaceAllHeroesInHq)}>Replace all Heroes</button>
          <button onClick={() => act(debugKoAllHeroesFromHq)}>KO all Heroes</button>
        </div>
      </section>

      <section className="debug-section">
        <h4>Player</h4>
        <div className="debug-actions">
          <button onClick={() => act(gainWound)}>Gain Wound</button>
          <button onClick={() => act(rescueBystander)}>Rescue Bystander</button>
          <button onClick={() => act(debugRemoveAllStartingCards)}>KO starting cards</button>
          <button onClick={() => act(debugDrawCard)}>Draw Card</button>
          <span className="debug-group">
            <input
              aria-label="Attack amount"
              type="number"
              value={attackAmount}
              onChange={(e) => setAttackAmount(Number(e.target.value))}
            />
            <button onClick={() => act((s) => addAttack(s, attackAmount))}>Add Attack</button>
          </span>
          <span className="debug-group">
            <input
              aria-label="Recruit amount"
              type="number"
              value={recruitAmount}
              onChange={(e) => setRecruitAmount(Number(e.target.value))}
            />
            <button onClick={() => act((s) => addRecruit(s, recruitAmount))}>Add Recruit</button>
          </span>
        </div>
      </section>

      <details className="debug-section">
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