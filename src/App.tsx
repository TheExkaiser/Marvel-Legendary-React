import { useState } from 'react'
import type { CSSProperties } from 'react'
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
import { StatsPanel } from './components/StatsPanel'
import { DeckPile } from './components/DeckPile'
import { useCardFlip } from './useCardFlip'
import './App.css'


// ---------- Stałe ----------

const CITY_NAMES = ['Sewers', 'Bank', 'Rooftops', 'Streets', 'Bridge']
const SHOW_DEBUG = true

// ---------- Małe komponenty pomocnicze ----------

/** Znaczek "👤 N" pod kartą, która trzyma jeńców (bystanderów). Nic nie rysuje dla 0. */
function CaptiveBadge({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) return null
  return (
    <button className="captive-badge" onClick={onClick}>
      👤 {count}
    </button>
  )
}

// ---------- Główny komponent ----------

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
  useCardFlip()
  
  const scheme = getScheme(state)
  const [viewingCaptivesOf, setViewingCaptivesOf] = useState<string | null>(null)

  const mastermindCaptives = state.captives[state.mastermind.instanceId]?.length ?? 0

  return (
    <div className="app">
      {/* ===== Nagłówek, log, wynik gry ===== */}
      <h1>Marvel Legendary</h1>
      <LogPanel log={state.log} />
      {state.status === 'won' && <h2>🎉 Wygrałeś! Mastermind pokonany.</h2>}
      {state.status === 'lost' && <h2>💀 Przegrałeś!</h2>}

      {/* ===== Scheme i liczniki ===== */}
      <h2>Scheme: {scheme.name}</h2>
      <p>
        Twisty: {state.twistsRevealed} / {scheme.twistCount}
        {Object.entries(state.counters).map(([name, value]) => ` | ${name}: ${value}`)}
      </p>
      <p>
        Stos ran: {state.wounds.length} | Stos bystanderów: {state.bystanders.length} |
        KO: {state.ko.length}
      </p>

      {SHOW_DEBUG && <DebugPanel state={state} act={act} />}

      {/* ===== Panel statystyk (przyklejony, lewy górny róg) ===== */}
      <StatsPanel
        turn={state.turn}
        attack={state.attack}
        recruit={state.recruit}
        victoryPoints={sumVictoryPoints(state, state.defeated)}
      />

      {/* ===== Mastermind (po lewej) + Miasto + talia villainów (po prawej) ===== */}
      <div className="board-top">
        <div className="mastermind-slot">
          <div className="zone-title">Tactics: {state.tactics.length}</div>
          <CardView
            data={state.cards[state.mastermind.cardId]}
            onClick={() => act(fightMastermind)}
          />
          <CaptiveBadge
            count={mastermindCaptives}
            onClick={() => setViewingCaptivesOf(state.mastermind.instanceId)}
          />
        </div>

        <div className="city-slot">
          <div className="zone-title">City (Escaped: {state.escaped.length})</div>
          <div className="city-row">
            <div className="row">
              {state.city.map((instance, i) => (
                <div key={i}>
                  {instance ? (
                    <CardView
                      data={state.cards[instance.cardId]}
                      flipId={instance.instanceId}
                      onClick={() => act((s, ui) => fightVillain(s, instance.instanceId, ui))}
                    />
                  ) : (
                    <div className="slot-empty">{CITY_NAMES[i]}</div>
                  )}
                  {instance && (
                    <CaptiveBadge
                      count={state.captives[instance.instanceId]?.length ?? 0}
                      onClick={() => setViewingCaptivesOf(instance.instanceId)}
                    />
                  )}
                  {state.cityMarkers[i].length > 0 && (
                    <div className="markers">{state.cityMarkers[i].join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
            <DeckPile count={state.villainDeck.length} />
          </div>
        </div>
      </div>

      {/* ===== Rekrutacja: oficer + HQ + talia bohaterów (po prawej) ===== */}
      <h2>HQ</h2>
      <div className="row recruit-row">
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
              flipId={instance.instanceId}
              flipFrom="hero-deck"
              onClick={() => act((s) => recruitHero(s, instance.instanceId))}
            />
          ) : (
            <div key={i} className="slot-empty" />
          ),
        )}
        <div className="deck-end">
          <DeckPile count={state.heroDeck.length} deckId="hero-deck" />
        </div>
      </div>

      {/* ===== Zagrane karty + talia gracza (po prawej) ===== */}
      <h2>Played ({state.played.length})</h2>
      <div className="row-with-deck">
        <div className="row">
          {state.played.map((c) => (
            <CardView key={c.instanceId} data={state.cards[c.cardId]} flipId={c.instanceId} />

          ))}
        </div>
        <DeckPile count={state.deck.length} />
      </div>

      {/* ===== Ręka: wachlarz przyklejony do dołu ekranu ===== */}
      <div className="hand-dock">
        <div className="hand-fan">
          {state.hand.map((c, i) => {
            const offset = i - (state.hand.length - 1) / 2 // 0 = środek wachlarza
            const angle = offset * Math.min(2.5, 18 / state.hand.length)
            const drop = offset * offset * 2 // krawędzie opadają, środek jest najwyżej
            return (
              <div
                key={c.instanceId}
                className="hand-slot"
                style={{ '--rot': `${angle}deg`, '--drop': `${drop}px` } as CSSProperties}
              >
                <CardView
                  data={state.cards[c.cardId]}
                  flipId={c.instanceId}
                  onClick={() => act((s, ui) => playCard(s, c.instanceId, ui))}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* ===== Panel stosów (przyklejony, lewy dolny róg) ===== */}
      <div className="piles-panel">
        <details>
          <summary>Stos odrzuconych ({state.discard.length})</summary>
          <div className="row piles-row">
            {state.discard.map((c) => (
              <CardView key={c.instanceId} data={state.cards[c.cardId]} />
            ))}
          </div>
        </details>

        <details>
          <summary>Victory Pool ({state.defeated.length})</summary>
          <div className="row piles-row">
            {state.defeated.map((c) => (
              <CardView key={c.instanceId} data={state.cards[c.cardId]} />
            ))}
          </div>
        </details>
      </div>

      {/* ===== Zakończ turę (przyklejony, prawy dolny róg) ===== */}
      <button
        className="end-turn-button"
        onClick={() => act(endTurn)}
        disabled={state.status !== 'playing'}
      >
        Zakończ turę
      </button>

      {/* ===== Popupy: wybór karty, wybór opcji, info, jeńcy ===== */}
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
