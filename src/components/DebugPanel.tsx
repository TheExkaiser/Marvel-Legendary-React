import { useState } from 'react'
import type { GameState } from '../engine/types'
import type { UiAdapter } from '../engine/ui'
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
      <strong>Debug</strong>

      <span className="debug-group">
        <button onClick={() => act((s) => { s.status = 'won' })}>Instant Win</button>
        <button onClick={() => act((s) => { s.status = 'lost' })}>Instant Lose</button>
      </span>

      <button onClick={() => act(gainWound)}>Gain Wound</button>
      <button onClick={() => act(rescueBystander)}>Rescue Bystander</button>
      <button onClick={() => act(debugReplaceAllHeroesInHq)}>Replace all heroes in HQ</button>
      <button onClick={() => act(debugRemoveAllStartingCards)}>KO starting cards</button> 
      <button onClick={() => act(debugDrawVillainCard)}>Draw Villain Card</button>
      <button
        disabled={masterStrikesRemaining === 0}
        onClick={() => act(debugPlayNextMasterStrike)}
      >
        Play next master strike ({masterStrikesRemaining})
      </button>
      <button
        disabled={schemeTwistsRemaining === 0}
        onClick={() => act(debugPlayNextSchemeTwist)}
      >
        Play next scheme twist ({schemeTwistsRemaining})
      </button>
      <button onClick={() => act(debugKoAllHeroesFromHq)}>KO all Heroes from HQ</button>
      <button onClick={() => act(debugEscapeAllVillainsFromCity)}>Escape all Villains from city</button>
      <button onClick={() => act(debugDrawCard)}>Draw Card</button>

      <span className="debug-group">
        <input
          type="number"
          value={attackAmount}
          onChange={(e) => setAttackAmount(Number(e.target.value))}
        />
        <button onClick={() => act((s) => addAttack(s, attackAmount))}>
          Add attacks
        </button>
      </span>

      <span className="debug-group">
        <input
          type="number"
          value={recruitAmount}
          onChange={(e) => setRecruitAmount(Number(e.target.value))}
        />
        <button onClick={() => act((s) => addRecruit(s, recruitAmount))}>
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