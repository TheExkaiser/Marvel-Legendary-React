import { useGame } from './useGame'
import { getScheme } from './engine/schemeRegistry'
import {
  playCard,
  recruitHero,
  fightVillain,
  fightMastermind,
  endTurn,
} from './engine/game'
import { CardView } from './components/CardView'
import './App.css'
import { ChoicePrompt } from './components/ChoicePrompt'
import { DebugPanel } from './components/DebugPanel'
import { sumVictoryPoints } from './engine/keywords'
import { OptionPrompt } from './components/OptionPrompt'

const CITY_NAMES = ['Sewers', 'Bank', 'Rooftops', 'Streets', 'Bridge']
const SHOW_DEBUG = true // false ukrywa przyciski testowe

function App() {
const { state, act, cardPrompt, answerCardPrompt, optionPrompt, answerOptionPrompt } = useGame()
  const scheme = getScheme(state)

  return (
    <div className="app">
      {/* ==================== NAGŁÓWEK I WYNIK GRY ==================== */}
      <h1>Marvel Legendary</h1>
      {state.status === 'won' && <h2>🎉 Wygrałeś! Mastermind pokonany.</h2>}
      {state.status === 'lost' && <h2>💀 Przegrałeś!</h2>}

      {/* ==================== SCHEME ==================== */}
      <h2>Scheme: {scheme.name}</h2>
      <p>
        Twisty: {state.twistsRevealed} / {scheme.twistCount}
        {Object.entries(state.counters).map(([name, value]) => ` | ${name}: ${value}`)}
      </p>

      {/* ==================== STATYSTYKI TURY I STOSY ==================== */}
      <p>
        Tura {state.turn} | Attack: {state.attack} | Recruit: {state.recruit} |
        Punkty zwycięstwa: {sumVictoryPoints(state, state.defeated)}
      </p>
      <p>
        Stos ran: {state.wounds.length} | Stos bystanderów: {state.bystanders.length} |
        KO: {state.ko.length}
      </p>

      {/* ==================== PRZYCISKI TESTOWE ==================== */}
      {SHOW_DEBUG && <DebugPanel act={act} />}

      {/* ==================== MASTERMIND ==================== */}
      <h2>Mastermind (pozostałe taktyki: {state.tactics.length})</h2>
      <div className="row">
        <CardView
          data={state.cards[state.mastermind.cardId]}
          onClick={() => act(fightMastermind)}
        />
      </div>

      {/* ==================== MIASTO ==================== */}
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
              {/* pole: złoczyńca albo pusty slot z nazwą */}
              {instance ? (
                <CardView
                  data={state.cards[instance.cardId]}
                  onClick={() => act((s) => fightVillain(s, instance.instanceId))}
                />
              ) : (
                <div className="slot-empty">{CITY_NAMES[i]}</div>
              )}
              {/* przetrzymywani bystanderzy */}
              {captiveCount > 0 && <div>Bystanderzy: {captiveCount}</div>}
              {/* znaczniki scheme'u (np. portale) */}
              {state.cityMarkers[i].length > 0 && (
                <div className="markers">{state.cityMarkers[i].join(', ')}</div>
              )}
            </div>
          )
        })}
      </div>

      {/* ==================== HQ (BOHATEROWIE DO KUPIENIA) ==================== */}
      <h2>HQ</h2>
      <div className="row">
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

      {/* ==================== ZAGRANE KARTY ==================== */}
      <h2>Zagrane ({state.played.length})</h2>
      <div className="row">
        {state.played.map((c) => (
          <CardView key={c.instanceId} data={state.cards[c.cardId]} />
        ))}
      </div>

      {/* ==================== RĘKA ==================== */}
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

      {/* ==================== TALIA GRACZA I KONIEC TURY ==================== */}
      <p>
        Talia: {state.deck.length} | Odrzucone: {state.discard.length}
      </p>
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
    </div>
  )
}

export default App