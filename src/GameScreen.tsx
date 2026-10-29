import { useState } from 'react'
import type { CSSProperties, WheelEvent as ReactWheelEvent } from 'react'
import { useGame } from './useGame'
import type { CardInstance, GameSetup } from './engine/types'
import { getScheme } from './engine/schemeRegistry'
import { sumVictoryPoints, finalScore } from './engine/keywords'
import {
  playCard,
  teleportCard,
  recruitHeroWithUi,
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
import { victoryPile, getCardData } from './engine/cardData'
import './styles/index.css'
import { getEffectiveStrength, getCapturedCards, isArtifactData } from './engine/keywords'
import { usableArtifactAbilities, activateArtifactAbility, isArtifactExhausted } from './engine/artifacts'
import { shardsOn, gameUsesShards, spendShardsWithPrompt } from './engine/shards'
import { useSettings } from './useSettings'
import { SettingsMenu } from './components/SettingsMenu'
import { CapturePrompt } from './components/CapturePrompt'
import { RescuePrompt } from './components/RescuePrompt'
import { AttackSplitPrompt } from './components/AttackSplitPrompt'
import { useEffect, useRef } from 'react'
import { appendGameLogEntry, formatDate, formatTime, type GameLogMeta } from './gameLog'
import { GameHistoryMenu } from './components/GameHistoryMenu'
import { KeywordsMenu } from './components/KeywordsMenu'
import { NumberPrompt } from './components/NumberPrompt'
import { StackedMasterStrikes } from './components/StackedMasterStrikes'
import { hasTeleport } from './engine/turn'
import { fightDemonGoblin, canAffordVillain, canAffordMastermind, canAffordDemonGoblin } from './engine/combat'
import { SchemeToken } from './components/SchemeToken'
import { canFocus, activateFocus } from './engine/focus'
import { hqCardCost, canAffordHqCard, canAffordOfficer } from './engine/recruit'


// ---------- Stałe ----------

const SHOW_DEBUG = true

// ---------- Główny komponent ----------

function GameScreen({
  setup,
  logMeta,
  onExit,
  onRestart = onExit, // dopóki App.tsx nie dostarczy prawdziwego restartu, zachowuje się jak Main Menu
}: {
  setup: GameSetup
  logMeta :GameLogMeta
  onExit: () => void
  onRestart?: () => void
}) {
  const { settings, updateSetting } = useSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const {
    state,
    act,
    debugAct,
    beginGame,
    cardPrompt,
    answerCardPrompt,
    optionPrompt,
    answerOptionPrompt,
    infoPrompt,
    closeInfoPrompt,
    cardsPrompt,
    closeCardsPrompt,
    capturePrompt,
    closeCapturePrompt,
    rescuePrompt,
    closeRescuePrompt,
    attackSplitPrompt,
    answerAttackSplitPrompt,
    numberPrompt,
    answerNumberPrompt,
    toast,
 } = useGame(setup, settings)
    const discardIds = new Set(state.discard.map((c) => c.instanceId))
  useCardFlip(discardIds)

  useEffect(() => {
  if (state.status === 'playing') return
  if (loggedRef.current) return
  loggedRef.current = true
  if (state.debugUsed) return

  const now = new Date()
  const result: 'Lose' | number =
    state.status === 'lost' ? 'Lose' : finalScore(state, victoryPile(state))

  appendGameLogEntry({
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    date: formatDate(now),
    time: formatTime(now),
    ...logMeta,
    result,
  })
}, [state.status])
  
  const scheme = getScheme(state)
  const negativeZoneActive =
    scheme.id === 'fantasticfour_pull_reality_into_the_negative_zone' && [2, 4, 6].includes(state.twistsRevealed)

  // Played: Artifacty pierwsze, potem Focus, następnie pozostałe karty; nazwy są grupowane razem.
  const playedRow: CardInstance[] = [
    ...(state.artifacts ?? []),
    ...state.played,
  ].sort((a, b) => {
    const dataA = getCardData(state, a)
    const dataB = getCardData(state, b)
    const orderA = isArtifactData(dataA) ? 0 : dataA.focus !== undefined ? 1 : 2
    const orderB = isArtifactData(dataB) ? 0 : dataB.focus !== undefined ? 1 : 2
    return orderA - orderB || dataA.name.localeCompare(dataB.name)
  })
  const [viewingCaptivesOf, setViewingCaptivesOf] = useState<string | null>(null)
  
  const [viewingPile, setViewingPile] = useState<'victory' | 'ko' | 'discard' | 'teleport' | null>(null)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [keywordsOpen, setKeywordsOpen] = useState(false)
  const loggedRef = useRef(false)
  const previousResourcesRef = useRef<{ attack: number; recruit: number; victory: number; shards: number } | null>(null)
  const [resourceDeltas, setResourceDeltas] = useState<Partial<Record<'attack' | 'recruit' | 'victory' | 'shards', number>>>({})
  const [resourceDeltaEventId, setResourceDeltaEventId] = useState(0)
  const victoryPoints = sumVictoryPoints(state, victoryPile(state))
  const playerShards = state.shards ?? 0
  const mastermindActions = (scheme.mastermindActions ?? [])
    .filter((action) => action.canActivate(state))
    .map((action) => ({
      label: action.label,
      onClick: () => act((s) => action.activate(s)),
    }))

  useEffect(() => {
    const previous = previousResourcesRef.current
    const current = { attack: state.attack, recruit: state.recruit, victory: victoryPoints, shards: playerShards }
    previousResourcesRef.current = current
    if (!previous) return

    const next: Partial<Record<'attack' | 'recruit' | 'victory' | 'shards', number>> = {}
    for (const key of ['attack', 'recruit', 'victory', 'shards'] as const) {
      const delta = current[key] - previous[key]
      if (delta !== 0) next[key] = delta
    }
    if (Object.keys(next).length === 0) return

    setResourceDeltaEventId((current) => current + 1)
    setResourceDeltas(next)
    const timeout = window.setTimeout(() => setResourceDeltas({}), 900)
    return () => window.clearTimeout(timeout)
  }, [state.attack, state.recruit, victoryPoints, playerShards])
  
  const mastermindCaptives = state.captives[state.mastermind.instanceId]?.length ?? 0
  
  const discardTop =
    state.discard.length > 0
      ? state.cards[state.discard[state.discard.length - 1].cardId]
      : undefined

  const teleported = state.teleported ?? []
  const teleportTop =
    teleported.length > 0 ? state.cards[teleported[teleported.length - 1].cardId] : undefined

  const pileViews = {
    victory: { title: 'Victory Pool', cards: state.defeated },
    ko: { title: "KO'd cards", cards: state.ko },
    discard: { title: 'Discard', cards: state.discard },
    teleport: { title: 'Teleport', cards: teleported },
  }

  // Stałe panele i przyciski potrafią przejąć wheel jako obszar interaktywny.
  // Przepuszczamy go do wewnętrznego panelu tylko wtedy, gdy panel faktycznie
  // może przewijać się w danym kierunku; w pozostałych przypadkach przewijamy planszę.
  function handleGameWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (event.deltaY === 0 || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

    const target = event.target as HTMLElement
    const fixedUi = target.closest<HTMLElement>(
      '.stats-panel, .log-shell, .drawer-tab, .drawer-panel, .hamburger-wrap, .end-turn-button, .piles-panel',
    )
    // W centrum planszy zostawiamy natywne przewijanie przeglądarki. Jest
    // płynniejsze niż ręczne wywoływanie scrollBy dla każdego eventu wheel.
    if (!fixedUi) return

    const scrollable = target.closest<HTMLElement>(
      '.log-drawer, .drawer-panel, .modal-content, .history-table-wrap, .pile-grid',
    )
    if (
      scrollable &&
      scrollable.scrollHeight > scrollable.clientHeight &&
      ((event.deltaY < 0 && scrollable.scrollTop > 0) ||
        (event.deltaY > 0 && scrollable.scrollTop + scrollable.clientHeight < scrollable.scrollHeight))
    ) {
      return
    }

    event.preventDefault()
    window.scrollBy(0, event.deltaY)
  }

  return (
    <div className="app" onWheel={handleGameWheel}>
      {/* ===== Górny pasek: log (na całą szerokość) + hamburger menu ===== */}
      <LogPanel log={state.log} />
      <HamburgerMenu
        onMainMenu={onExit}
        onRestart={onRestart}
        onSettings={() => setSettingsOpen(true)}
        onHistory={() => setHistoryOpen(true)}
        onKeywords={() => setKeywordsOpen(true)}
      />
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
          <DebugPanel state={state} act={debugAct} />
        </SlideDrawer>
      )}

      {/* ===== Panel statystyk (przyklejony, lewy górny róg) ===== */}
      <StatsPanel
        turn={state.turn}
        attack={state.attack}
        recruit={state.recruit}
        victoryPoints={victoryPoints}
        resourceDeltas={resourceDeltas}
        resourceDeltaEventId={resourceDeltaEventId}
        onVictoryClick={() => setViewingPile('victory')}
        shards={gameUsesShards(state) ? playerShards : undefined}
        onShardsClick={() => act(spendShardsWithPrompt)}
        scheme={{
          ...scheme,
          shardsInSupply:
            scheme.shardSupplyLimit === undefined
              ? undefined
              : (state.shardSupply ?? scheme.shardSupplyLimit),
        }}
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
            highlight={canAffordMastermind(state) ? 'attack' : undefined}
            effectiveStrength={getEffectiveStrength(state, state.mastermind)}
            strengthResource={negativeZoneActive ? 'recruit' : 'attack'}
            capturedCards={getCapturedCards(state, state.mastermind.instanceId)}
            shards={shardsOn(state, state.mastermind)}
            artifactButtons={mastermindActions}
          />
          {state.mastermind.cardId === 'mastermind-thanos' && (
            <div className="markers">Bound Souls: {mastermindCaptives}</div>
          )}
          {scheme.id === 'gotg_the_kree_skrull_war' ? (
            <div className="markers">
              <div>Skrull: {state.schemeTwists?.length ?? 0}</div>
              <div>Kree: {state.mastermindSchemeTwists?.length ?? 0}</div>
            </div>
          ) : (state.mastermindSchemeTwists?.length ?? 0) > 0 ? (
            <div className="markers">{scheme.mastermindTwistLabel ?? 'Mastermind Twists'}: {state.mastermindSchemeTwists!.length}</div>
          ) : null}
          <StackedMasterStrikes
            cards={state.stackedMasterStrikes ?? []}
            cardIndex={state.cards}
          />          
        </div>

        <div className="city-slot">
          <div className="zone-title">
            City (Escaped: {state.escaped.length})
            {(state.schemeTokens ?? []).map((t) => (
              <SchemeToken key={t.instanceId} data={state.cards[t.cardId]} />
            ))}
          </div>
          <div className="city-row">
            <div className="row">
              {state.city.map((instance, i) => (
                <div key={i}>
                  {state.cityDestroyed?.[i] ? (
                    <div className="destroyed-city-token" title="Destroyed City">
                      <img
                        src={`${import.meta.env.BASE_URL}tokens/destroyed_city_token.jpg`}
                        alt="Destroyed City"
                      />
                    </div>
                  ) : instance ? (
                    <CardView
                      data={state.cards[instance.cardId]}
                      flipId={instance.instanceId}
                      onClick={() => act((s, ui) => fightVillain(s, instance.instanceId, ui))}
                      highlight={canAffordVillain(state, instance) ? 'attack' : undefined}
                      effectiveStrength={getEffectiveStrength(state, instance)}
                      strengthResource={negativeZoneActive ? 'recruit' : 'attack'}
                      capturedCards={getCapturedCards(state, instance.instanceId)}
                      shards={shardsOn(state, instance)}
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
            {(state.demonGoblins?.length ?? 0) > 0 && (
              <DeckPile
                count={state.demonGoblins!.length}
                deckId="demon-goblins"
                label="Demon Goblins (2 Attack)"
                onClick={() => act(fightDemonGoblin)}
                highlight={canAffordDemonGoblin(state) ? 'attack' : undefined}
              />
            )}
          </div>
        </div>
      </div>

      {/* ===== Rekrutacja: oficer + HQ + talia bohaterów (po prawej) ===== */}
      <section className="section-block section-block-hq">
        <h2 className="section-heading">HQ</h2>
        <div className="row recruit-row">
        <div className="officer-slot">
          {state.officerDeck.length > 0 && (
            <CardView
              data={state.cards[state.officerCardId]}
              flipId={state.officerDeck[state.officerDeck.length - 1].instanceId}
              onClick={() => act((s) => recruitOfficer(s))}
              highlight={canAffordOfficer(state) ? 'buy' : undefined}
            />
          )}
          <div>Remaining: {state.officerDeck.length}</div>
        </div>
        {state.hq.map((instance, i) => {
          const explosions = state.hqExplosions?.[i] ?? 0
          const destroyed = state.hqDestroyed?.[i] ?? false
          const hqData = instance ? state.cards[instance.cardId] : undefined
          const hqVillain = scheme.canFightVillainsInHq === true && !!hqData &&
            (hqData.villainGroup !== undefined || hqData.henchman === true)
          return (
            <div key={instance?.instanceId ?? `hq-${i}`}>
              {instance ? (
                <CardView
                  data={state.cards[instance.cardId]}
                  flipId={instance.instanceId}
                  flipFrom="hero-deck"
                  effectiveStrength={hqVillain ? getEffectiveStrength(state, instance) : undefined}
                  shards={shardsOn(state, instance)}
                  effectiveCost={hqVillain ? undefined : hqCardCost(state, i)}
                  costResource={negativeZoneActive ? 'attack' : 'recruit'}
                  strengthResource={negativeZoneActive ? 'recruit' : 'attack'}
                  highlight={
                    hqVillain
                      ? (canAffordVillain(state, instance) ? 'attack' : undefined)
                      : (canAffordHqCard(state, i) ? 'buy' : undefined)
                  }
                  onClick={() => act((s, ui) =>
                    hqVillain
                      ? fightVillain(s, instance.instanceId, ui)
                      : recruitHeroWithUi(s, instance.instanceId, ui),
                  )}
                />
              ) : (
                <div className={destroyed ? 'slot-empty slot-destroyed' : 'slot-empty'}>
                  {destroyed ? 'Destroyed' : ''}
                </div>
              )}
              {explosions > 0 && (
                <div className="helicarrier-explosion-marker" title={`Helicarrier explosions: ${explosions}`}>
                  <img
                    src={`${import.meta.env.BASE_URL}tokens/destoyed_helicarrier_token.jpg`}
                    alt="Helicarrier explosion"
                  />
                  <span>{explosions}</span>
                </div>
              )}
            </div>
          )
        })}
        <div className="deck-end">
          <DeckPile count={state.heroDeck.length} deckId="hero-deck" />
        </div>
        </div>
      </section>

      {/* ===== Zagrane karty + talia gracza (po prawej) ===== */}
      <section className="section-block section-block-played">
        <h2 className="section-heading">Played ({playedRow.length})</h2>
        <div className="row-with-deck">
        <div className="row">
          {playedRow.map((c) => {
            const data = getCardData(state, c)
            const artifact = isArtifactData(data)
            return (
              <CardView
                key={c.instanceId}
                data={data}
                flipId={c.instanceId}
                shards={artifact ? shardsOn(state, c) : undefined}
                dimmed={artifact ? isArtifactExhausted(state, c) : data.focus === undefined}
                focusButton={
                  canFocus(state, c)
                    ? {
                        cost: data.focus!,
                        onClick: () => act((s, ui) => activateFocus(s, c.instanceId, ui)),
                      }
                    : undefined
                }
                artifactButtons={
                  artifact
                    ? usableArtifactAbilities(state, c).map((ability) => ({
                        label: ability.label,
                        onClick: () => act((s, ui) => activateArtifactAbility(s, c.instanceId, ability.id, ui)),
                      }))
                    : undefined
                }
              />
            )
          })}
        </div>
        <div className="deck-group">
          <DeckPile count={state.deck.length} deckId="deck" />
          <DeckPile
            count={state.discard.length}
            deckId="discard"
            topCard={discardTop}
            onClick={() => setViewingPile('discard')}
          />
          {teleported.length > 0 && (
            <DeckPile
              count={teleported.length}
              deckId="teleport"
              topCard={teleportTop}
              label="Teleport"
              onClick={() => setViewingPile('teleport')}
            />
          )}
        </div>
        </div>
      </section>

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
                  data={getCardData(state, c)}
                  flipId={c.instanceId}
                  flipFrom="deck"
                  onClick={() =>
                    act(async (s, ui) => {
                      if (hasTeleport(s, c)) {
                        const choice = await ui.chooseOptionWithCard(
                          c,
                          [
                            { id: 'play', label: 'Play' },
                            { id: 'teleport', label: 'Teleport' },
                          ],
                            'Play the card or teleport it?',
                        )
                        if (choice === 'teleport') {
                          await teleportCard(s, c.instanceId, ui)
                          return
                        }
                        if (choice !== 'play') return
                      }
                      await playCard(s, c.instanceId, ui)
                    })
                  }
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
        End Turn
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
      {cardsPrompt && (
        <PilePrompt
          title={cardsPrompt.title}
          cards={cardsPrompt.cards}
          cardsById={state.cards}
          onClose={closeCardsPrompt}
        />
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

      {rescuePrompt && (
        <RescuePrompt
          message={rescuePrompt.message}
          bystanderData={state.cards[rescuePrompt.bystander.cardId]}
          onClose={closeRescuePrompt}
        />
      )}

      {attackSplitPrompt && (
        <AttackSplitPrompt
          cost={attackSplitPrompt.cost}
          maxFromAttack={attackSplitPrompt.maxFromAttack}
          maxFromRecruit={attackSplitPrompt.maxFromRecruit}
          onConfirm={answerAttackSplitPrompt}
        />
      )}

      {numberPrompt && (
        <NumberPrompt
          prompt={numberPrompt.prompt}
          initial={numberPrompt.initial}
          min={numberPrompt.min}
          max={numberPrompt.max}
          onConfirm={answerNumberPrompt}
        />
      )}

      {toast && (
        <div key={toast.id} className="game-toast">
          {toast.message}
        </div>
      )}

      {historyOpen && <GameHistoryMenu onClose={() => setHistoryOpen(false)} />}
      {keywordsOpen && <KeywordsMenu cards={Object.values(state.cards)} onClose={() => setKeywordsOpen(false)} />}
    </div>
  )
}



export default GameScreen
