import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useGame } from './useGame'
import type { GameSetup } from './engine/types'
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
import { DebugPanel } from './components/DebugPanel'
import { LogPanel } from './components/LogPanel'
import { StatsPanel } from './components/StatsPanel'
import { DeckPile } from './components/DeckPile'
import { HamburgerMenu } from './components/HamburgerMenu'
import { SlideDrawer } from './components/SlideDrawer'
import { useCardFlip } from './useCardFlip'
import { PilePrompt } from './components/PilePrompt'
import { CITY_NAMES } from './engine/constants'
import './App.css'
import { getEffectiveStrength, getCapturedCards } from './engine/keywords'
import { useSettings } from './useSettings'
import { SettingsMenu } from './components/SettingsMenu'
import { CapturePrompt } from './components/CapturePrompt'


// ---------- Stałe ----------

const SHOW_DEBUG = true

// ---------- Główny komponent ----------

function GameScreen({
  setup,
  onExit,
  onRestart = onExit, // dopóki App.tsx nie dostarczy prawdziwego restartu, zachowuje się jak Main Menu
}: {
  setup: GameSetup
  onExit: () => void
  onRestart?: () => void
}) {
  const { settings, updateSetting } = useSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const {
    state,
    act,
    beginGame,
    cardPrompt,
    answerCardPrompt,
    optionPrompt,
    answerOptionPrompt,
    infoPrompt,
    closeInfoPrompt,
    capturePrompt,
    closeCapturePrompt
 } = useGame(setup, settings)
    const discardIds = new Set(state.discard.map((c) => c.instanceId))
  useCardFlip(discardIds)
  
  const scheme = getScheme(state)
  const [viewingCaptivesOf, setViewingCaptivesOf] = useState<string | null>(null)
  
  const [viewingPile, setViewingPile] = useState<'victory' | 'ko' | 'discard' | null>(null)

  const mastermindCaptives = state.captives[state.mastermind.instanceId]?.length ?? 0
  
  const discardTop =
    state.discard.length > 0
      ? state.cards[state.discard[state.discard.length - 1].cardId]
      : undefined

  const pileViews = {
    victory: { title: 'Victory Pool', cards: state.defeated },
    ko: { title: "KO'd cards", cards: state.ko },
    discard: { title: 'Discard', cards: state.discard },
  }

  return (
    <div className="app">
      {/* ===== Górny pasek: log (na całą szerokość) + hamburger menu ===== */}
      <LogPanel log={state.log} />
      <HamburgerMenu onMainMenu={onExit} onRestart={onRestart} onSettings={() => setSettingsOpen(true)} />

      {(state.status === 'won' || state.status === 'lost') && (
        <div className="modal-overlay">
          <div className="modal-content game-over-content">
            <h2>{state.status === 'won' ? '🎉 You Win!' : '💀 You Lose'}</h2>
            <p>{state.status === 'won' ? 'Mastermind defeated.' : 'Evil wins.'}</p>
            <div className="game-over-buttons">
              <button onClick={onRestart}>Restart</button>
              <button onClick={onExit}>Main Menu</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Wysuwany panel: debug (znika całkowicie po ustawieniu SHOW_DEBUG=false) ===== */}
      {SHOW_DEBUG && (
        <SlideDrawer edge="left" tabLabel="Debug">
          <DebugPanel state={state} act={act} />
        </SlideDrawer>
      )}

      {/* ===== Panel statystyk (przyklejony, lewy górny róg) ===== */}
      <StatsPanel
        turn={state.turn}
        attack={state.attack}
        recruit={state.recruit}
        victoryPoints={sumVictoryPoints(state, state.defeated)}
        onVictoryClick={() => setViewingPile('victory')}
        scheme={scheme}
        twistsRevealed={state.twistsRevealed}
        twistCount={scheme.twistCount}
        counters={state.counters}
        wounds={state.wounds.length}
        bystanders={state.bystanders.length}
        ko={state.ko.length}
        onKoClick={() => setViewingPile('ko')}
        initialSchemeOpen
        onSchemeIntroClose={beginGame}
      />

      {/* ===== Mastermind (po lewej) + Miasto + talia villainów (po prawej) ===== */}
      <div className="board-top">
        <div className="mastermind-slot">
          <div className="zone-title">Tactics: {state.tactics.length}</div>
          <CardView
            data={state.cards[state.mastermind.cardId]}
            onClick={() => act(fightMastermind)}
            effectiveStrength={getEffectiveStrength(state, state.mastermind)}
            capturedCards={getCapturedCards(state, state.mastermind.instanceId)}
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
                      effectiveStrength={getEffectiveStrength(state, instance)}
                      capturedCards={getCapturedCards(state, instance.instanceId)}
                    />
                  ) : (
                    <div className="slot-empty">{CITY_NAMES[i]}</div>
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
          {state.officerDeck.length > 0 && (
            <CardView
              data={state.cards[state.officerCardId]}
              flipId={state.officerDeck[state.officerDeck.length - 1].instanceId}
              onClick={() => act((s) => recruitOfficer(s))}
            />
          )}
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
        <div className="deck-group">
          <DeckPile count={state.deck.length} deckId="deck" />
          <DeckPile
            count={state.discard.length}
            deckId="discard"
            topCard={discardTop}
            onClick={() => setViewingPile('discard')}
          />
        </div>
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
                  flipFrom="deck"
                  onClick={() => act((s, ui) => playCard(s, c.instanceId, ui))}
                />
              </div>
            )
          })}
        </div>
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
          cardData={optionPrompt.card ? state.cards[optionPrompt.card.cardId] : undefined}
        />
      )}
      {infoPrompt && (
        <TacticPrompt state={state} card={infoPrompt.card} onClose={closeInfoPrompt} />
      )}
      {viewingPile && (
        <PilePrompt
          title={pileViews[viewingPile].title}
          cards={pileViews[viewingPile].cards}
          cardsById={state.cards}
          onClose={() => setViewingPile(null)}
        />
      )}

      {settingsOpen && (
        <SettingsMenu settings={settings} onChange={updateSetting} onClose={() => setSettingsOpen(false)} />
      )}
      {capturePrompt && (
        <CapturePrompt
          message={capturePrompt.message}
          capturerData={state.cards[capturePrompt.capturer.cardId]}
          bystanderData={state.cards[capturePrompt.bystander.cardId]}
          onClose={closeCapturePrompt}
        />
      )}
    </div>
  )
}



export default GameScreen
