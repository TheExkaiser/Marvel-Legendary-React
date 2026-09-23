import { useState } from 'react'
import { useGame } from './useGame'
import { getScheme } from './engine/schemeRegistry'
import { sumVictoryPoints } from './engine/keywords'
import {
  playCard,
  recruitHero,
  recruitOfficer,
  fightVillain,
  fightMastermind,
  endTurn,
} from './engine/game'
import { CardView } from './components/CardView'
import { ChoicePrompt } from './components/ChoicePrompt'
import { OptionPrompt } from './components/OptionPrompt'
import { TacticPrompt } from './components/TacticPrompt'
import { CaptivesPrompt } from './components/CaptivesPrompt'
import { DebugPanel } from './components/DebugPanel'
import { LogPanel } from './components/LogPanel'
import './App.css'

const CITY_NAMES = ['Sewers', 'Bank', 'Rooftops', 'Streets', 'Bridge']
const SHOW_DEBUG = true

function App() {
  const {
    state,
    act,
    cardPrompt,
    answerCardPrompt,
    optionPrompt,
    answerOptionPrompt,
    infoPrompt,
    closeInfoPrompt,
  } = useGame()
  const scheme = getScheme(state)
  const [viewingCaptivesOf, setViewingCaptivesOf] = useState<string | null>(null)

  return (
    <div className="app">
      <h1>Marvel Legendary</h1>
      <LogPanel log={state.log} />
      {state.status === 'won' && <h2>🎉 Wygrałeś! Mastermind pokonany.</h2>}
      {state.status === 'lost' && <h2>💀 Przegrałeś!</h2>}

      <h2>Scheme: {scheme.name}</h2>
      <p>
        Twisty: {state.twistsRevealed} / {scheme.twistCount}
        {Object.entries(state.counters).map(([name, value]) => ` | ${name}: ${value}`)}
      </p>

      <p>
        Tura {state.turn} | Attack: {state.attack} | Recruit: {state.recruit} |
        Punkty zwycięstwa: {sumVictoryPoints(state, state.defeated)}
      </p>
      <p>
        Stos ran: {state.wounds.length} | Stos bystanderów: {state.bystanders.length} |
        KO: {state.ko.length}
      </p>

      {SHOW_DEBUG && <DebugPanel state={state} act={act} />}

      <h2>Mastermind (pozostałe taktyki: {state.tactics.length})</h2>
      <div className="row">
        <div>
          <CardView
            data={state.cards[state.mastermind.cardId]}
            onClick={() => act(fightMastermind)}
          />
          {(state.captives[state.mastermind.instanceId]?.length ?? 0) > 0 && (
            <button
              className="captive-badge"
              onClick={() => setViewingCaptivesOf(state.mastermind.instanceId)}
            >
              👤 {state.captives[state.mastermind.instanceId]?.length}
            </button>
          )}
        </div>
      </div>

      <h2>
        Miasto (talia: {state.villainDeck.length}, uciekło: {state.escaped.length},
        pokonani: {state.defeated.length})
      </h2>
      <div className="row">
        {state.city.map((instance, i) => {
          const captiveCount = instance
            ? (state.captives[instance.instanceId]?.length ?? 0)
            : 0
          return (
            <div key={i}>
              {instance ? (
                <CardView
                  data={state.cards[instance.cardId]}
onClick={() => act((s, ui) => fightVillain(s, instance.instanceId, ui))}
                />
              ) : (
                <div className="slot-empty">{CITY_NAMES[i]}</div>
              )}
              {captiveCount > 0 && (
                <button
                  className="captive-badge"
                  onClick={() => setViewingCaptivesOf(instance!.instanceId)}
                >
                  👤 {captiveCount}
                </button>
              )}
              {state.cityMarkers[i].length > 0 && (
                <div className="markers">{state.cityMarkers[i].join(', ')}</div>
              )}
            </div>
          )
        })}
      </div>

      <h2>Rekrutacja</h2>
      <div className="row">
        <div className="officer-slot">
          <CardView
            data={state.cards[state.officerCardId]}
            onClick={() => act((s) => recruitOfficer(s))}
          />
          <div>Pozostało: {state.officerDeck.length}</div>
        </div>
        {state.hq.map((instance, i) =>
          instance ? (
            <CardView
              key={instance.instanceId}
              data={state.cards[instance.cardId]}
              onClick={() => act((s) => recruitHero(s, instance.instanceId))}
            />
          ) : (
            <div key={i} className="slot-empty" />
          ),
        )}
      </div>

      <h2>Zagrane ({state.played.length})</h2>
      <div className="row">
        {state.played.map((c) => (
          <CardView key={c.instanceId} data={state.cards[c.cardId]} />
        ))}
      </div>

      <h2>Ręka ({state.hand.length})</h2>
      <div className="row">
        {state.hand.map((c) => (
          <CardView
            key={c.instanceId}
            data={state.cards[c.cardId]}
            onClick={() => act((s, ui) => playCard(s, c.instanceId, ui))}
          />
        ))}
      </div>

      <p>Talia: {state.deck.length}</p>

      <details>
        <summary>Stos odrzuconych ({state.discard.length})</summary>
        <div className="row">
          {state.discard.map((c) => (
            <CardView key={c.instanceId} data={state.cards[c.cardId]} />
          ))}
        </div>
      </details>

      <details>
        <summary>Victory Pool ({state.defeated.length})</summary>
        <div className="row">
          {state.defeated.map((c) => (
            <CardView key={c.instanceId} data={state.cards[c.cardId]} />
          ))}
        </div>
      </details>

      <button onClick={() => act(endTurn)} disabled={state.status !== 'playing'}>
        Zakończ turę
      </button>

      {cardPrompt && (
        <ChoicePrompt
          state={state}
          options={cardPrompt.options}
          prompt={cardPrompt.prompt}
          optional={cardPrompt.optional}
          onChoose={answerCardPrompt}
        />
      )}
      {optionPrompt && (
        <OptionPrompt
          options={optionPrompt.options}
          prompt={optionPrompt.prompt}
          onChoose={answerOptionPrompt}
        />
      )}
      {infoPrompt && (
        <TacticPrompt state={state} card={infoPrompt.card} onClose={closeInfoPrompt} />
      )}
      {viewingCaptivesOf && (
        <CaptivesPrompt
          state={state}
          captives={state.captives[viewingCaptivesOf] ?? []}
          onClose={() => setViewingCaptivesOf(null)}
        />
      )}
    </div>
  )
}

export default App