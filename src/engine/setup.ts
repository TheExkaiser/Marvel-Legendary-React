import type { GameState, GameSetup, CardData } from './types'
import type { UiAdapter } from './ui'
import { registerScheme } from './schemeRegistry'
import { registerGameMode } from './gameModeRegistry'
import { buildDeck } from './deck'
import { shuffle } from './random'
import { HAND_SIZE } from './constants'
import { drawCards } from './deckOps'
import { refillHq } from './recruit'
import { villainPhase } from './villainPhase'

/** Dokleja BASE_URL do ścieżki obrazka, tak jak już robimy to dla ikon — żeby działało
 * identycznie lokalnie (BASE_URL='/') i po deployu na GitHub Pages (BASE_URL='/nazwa-repo/').
 * Nie mutuje oryginalnej karty (to singleton z cards.ts, używany w kolejnych grach). */
function withPrefixedImg(card: CardData): CardData {
  if (!card.img || /^https?:\/\//.test(card.img)) return card
  return { ...card, img: `${import.meta.env.BASE_URL}${card.img.replace(/^\//, '')}` }
}

/** Buduje słownik id -> dane karty ze wszystkich kart użytych w grze. */
function buildCardIndex(setup: GameSetup): Record<string, CardData> {
  const { startingCards, heroCards, villainCards, mastermind } = setup

  const allCards: CardData[] = [
    ...[...startingCards, ...heroCards, ...villainCards].map((e) => e.card),
    setup.officerCards.card,
    setup.wounds.card,
    setup.bystanders.card,
    setup.twist,
    setup.masterStrikeCard,
    mastermind.card,
    ...mastermind.tactics,
  ]

  const cards: Record<string, CardData> = {}
  for (const card of allCards) {
    cards[card.id] = withPrefixedImg(card)
  }

  // Generyczna karta Master Strike dostaje opis efektu aktualnego mastermina
  cards[setup.masterStrikeCard.id] = withPrefixedImg({
    ...setup.masterStrikeCard,
    text: mastermind.masterStrikeText,
  })

  return cards
}

/** Tworzy pełny, gotowy do gry stan (talie potasowane, HQ zapełnione, setup scheme'u wykonany). */
export function createGameState(setup: GameSetup): GameState {
  const { startingCards, heroCards, villainCards, mastermind, scheme, gameMode } = setup
  registerScheme(scheme)
  registerGameMode(gameMode)

  // Bystanderzy: część trafia do talii złoczyńców, reszta zostaje w stosie
  const bystanders = shuffle(buildDeck([setup.bystanders]))
  const bystandersForVillainDeck = bystanders.splice(0, setup.bystandersInVillainDeck)

  const twists = buildDeck([{ card: setup.twist, count: scheme.twistCount }])
  const masterStrikes = buildDeck([
    { card: setup.masterStrikeCard, count: setup.masterStrikeCount },
  ])

  const state: GameState = {
    cards: buildCardIndex(setup),

    // Gracz
    deck: shuffle(buildDeck(startingCards)),
    hand: [],
    played: [],
    discard: [],
    cardsPlayedThisTurn: [],

    // Rekrutacja
    heroDeck: shuffle(buildDeck(heroCards)),
    hq: [null, null, null, null, null],
    officerDeck: shuffle(buildDeck([setup.officerCards])),
    officerCardId: setup.officerCards.card.id,

    // Złoczyńcy i miasto
    villainDeck: shuffle([
      ...buildDeck(villainCards),
      ...bystandersForVillainDeck,
      ...twists,
      ...masterStrikes,
    ]),
    city: [null, null, null, null, null],
    cityMarkers: [[], [], [], [], []],
    escaped: [],
    defeated: [],

    // Ranki, bystanderzy, jeńcy, KO
    wounds: buildDeck([setup.wounds]),
    bystanders,
    captives: {},
    attachedCards: {},
    locationAttackModifiers: {},
    mastermindAttackModifierThisTurn: 0,
    recruitCountsAsAttackThisTurn: false,
    cardsDrawnThisTurn: 0,
    recruitGainedThisTurn: 0,
    pendingSurgeOfPower: 0,
    attackGainedThisTurn: 0,
    ko: [],

    // Mastermind
    mastermind: { instanceId: mastermind.card.id, cardId: mastermind.card.id },
    tactics: shuffle(mastermind.tactics.map((t) => ({ instanceId: t.id, cardId: t.id }))),
    masterStrikeId: mastermind.masterStrikeId,

    // Scheme + Game Mode
    schemeId: scheme.id,
    gameModeId: gameMode.id,
    counters: {},
    twistsRevealed: 0,

    // Tura i zasoby
    log: [],
    attack: 0,
    recruit: 0,
    turn: 1,
    extraTurnsQueued: 0,
    bonusDrawNextTurn: 0,
    status: 'playing',
    debugUsed: false,
  }

  refillHq(state)
  scheme.setup?.(state)
  return state
}

/** Start gry: pierwsza ręka + pierwsza faza złoczyńcy. */
export async function startGame(state: GameState, ui: UiAdapter): Promise<void> {
  drawCards(state, HAND_SIZE)
  state.cardsDrawnThisTurn = 0 // pierwsza ręka też się nie liczy jako "extra"
  await villainPhase(state, ui)
}