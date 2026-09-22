import type { GameState, GameSetup, CardData, CardInstance } from './types'
import { registerScheme, getScheme } from './schemeRegistry'
import { buildDeck } from './deck'
import { shuffle } from './random'
import type { UiAdapter } from './ui'
import { getCardAbility } from './cardAbilities'

const HAND_SIZE = 6        // ile kart dobiera gracz
const ESCAPE_LIMIT = 3     // TEST: ilu uciekłych złoczyńców oznacza porażkę (sprawdź w instrukcji)

function assertPlaying(state: GameState): void {
  if (state.status !== 'playing') throw new Error('Gra jest już zakończona')
}

// ---------- Przygotowanie gry ----------

export function createGameState(setup: GameSetup): GameState {
  const { startingCards, heroCards, villainCards, mastermind, scheme } = setup
  registerScheme(scheme)

  // Słownik wszystkich kart w grze: id -> dane
  const allCards: CardData[] = [
    ...[...startingCards, ...heroCards, ...villainCards].map((e) => e.card),
    setup.wounds.card,
    setup.bystanders.card,
    setup.twist,
    mastermind.card,
    ...mastermind.tactics,
  ]
  const cards: Record<string, CardData> = {}
  for (const card of allCards) {
    cards[card.id] = card
  }

  // Część bystanderów trafia do talii złoczyńców, reszta tworzy stos
  const bystanders = shuffle(buildDeck([setup.bystanders]))
  const bystandersForVillainDeck = bystanders.splice(0, setup.bystandersInVillainDeck)
  const twists = buildDeck([{ card: setup.twist, count: scheme.twistCount }])

  const state: GameState = {
    cards,
    deck: shuffle(buildDeck(startingCards)),
    hand: [],
    cardsPlayedThisTurn: [],
    played: [],
    discard: [],
    heroDeck: shuffle(buildDeck(heroCards)),
    hq: [null, null, null, null, null],
    villainDeck: shuffle([
      ...buildDeck(villainCards),
      ...bystandersForVillainDeck,
      ...twists,
    ]),
    city: [null, null, null, null, null],
    cityMarkers: [[], [], [], [], []],
    escaped: [],
    defeated: [],
    wounds: buildDeck([setup.wounds]),
    bystanders,
    captives: {},
    ko: [],
    mastermind: { instanceId: mastermind.card.id, cardId: mastermind.card.id },
    tactics: shuffle(
      mastermind.tactics.map((t) => ({ instanceId: t.id, cardId: t.id })),
    ),
    schemeId: scheme.id,
    counters: {},
    twistsRevealed: 0,
    attack: 0,
    recruit: 0,
    turn: 1,
    extraTurnsQueued: 0,
    bonusDrawNextTurn: 0,
    status: 'playing',
  }

  refillHq(state)
  scheme.setup?.(state) // scheme dokłada swoje przygotowanie
  return state
}

export function startGame(setup: GameSetup): GameState {
  const state = createGameState(setup)
  drawCards(state, HAND_SIZE)
  villainPhase(state)
  return state
}

// ---------- Ręka i talia gracza ----------

export function drawCards(state: GameState, count: number): void {
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) {
      // Talia pusta: przetasuj stos odrzuconych i zrób z niego nową talię
      if (state.discard.length === 0) return // nie ma z czego dobierać
      state.deck = shuffle(state.discard)
      state.discard = []
    }

    const card = state.deck.pop()!
    state.hand.push(card)
  }
}

export async function playCard(
  state: GameState,
  instanceId: string,
  ui: UiAdapter,
): Promise<void> {
  assertPlaying(state)
  const index = state.hand.findIndex((c) => c.instanceId === instanceId)
  if (index === -1) throw new Error(`Karty ${instanceId} nie ma w ręce`)

  const data = state.cards[state.hand[index].cardId]
  if (data.kind === 'wound') throw new Error('Rany nie da się zagrać')

  const [instance] = state.hand.splice(index, 1)
  state.played.push(instance)
  state.attack += data.attack ?? 0
  state.recruit += data.recruit ?? 0

  const ability = getCardAbility(instance.cardId)
  if (ability) {
    await ability(state, { self: instance, ui })
  }

  // Dopiero teraz karta liczy się jako "zagrana w tej turze" -
  // efekty typu "if covert played this turn" nie widzą same siebie
  state.cardsPlayedThisTurn.push(instance)
}

export async function endTurn(state: GameState, ui: UiAdapter): Promise<void> {
  assertPlaying(state)

  state.discard.push(...state.hand, ...state.played)
  state.hand = []
  state.played = []
  state.attack = 0
  state.recruit = 0

  const drawAmount = HAND_SIZE + state.bonusDrawNextTurn
  state.bonusDrawNextTurn = 0

  if (state.extraTurnsQueued > 0) {
    // Dodatkowa tura: bez nowego numeru tury i bez fazy złoczyńcy
    state.extraTurnsQueued -= 1
    drawCards(state, drawAmount)
  } else {
    state.turn += 1
    drawCards(state, drawAmount)
    villainPhase(state)
  }
}

// ---------- Faza złoczyńcy i miasto ----------

export function villainPhase(state: GameState): void {
  const card = state.villainDeck.pop()
  if (!card) return // talia złoczyńców pusta

  const data = state.cards[card.cardId]
  console.log(`Tura ${state.turn}: odkryto ${data.name}`)

  if (data.kind === 'bystander') {
    captureBystander(state, card)
  } else if (data.kind === 'twist') {
    resolveTwist(state, card)
  } else {
    enterCity(state, card)
  }

  checkEndConditions(state)
}

function enterCity(state: GameState, villain: CardInstance): void {
  let moving: CardInstance | null = villain

  // Idziemy od Bridge (ostatnie pole) w stronę Sewers (pierwsze)
  for (let i = state.city.length - 1; i >= 0 && moving; i--) {
    const occupant: CardInstance | null = state.city[i]
    state.city[i] = moving
    moving = occupant // dotychczasowy lokator przesuwa się dalej
  }

  // Jeśli ktoś został wypchnięty poza Sewers, ucieka
  if (moving) {
    state.escaped.push(moving)
    console.log(`Ucieka: ${state.cards[moving.cardId].name}`)

    // Jego bystanderzy przepadają. TODO: sprawdź w instrukcji, co dokładnie się z nimi dzieje
    const lost = state.captives[moving.instanceId] ?? []
    state.ko.push(...lost)
    delete state.captives[moving.instanceId]

    // TODO: skutki ucieczki (m.in. KO bohatera z HQ), sprawdź w instrukcji
    getScheme(state).onVillainEscaped?.(state, moving)
  }

  getScheme(state).onVillainEntered?.(state, villain)
}

// ---------- HQ i kupowanie ----------

// Uzupełnia puste sloty HQ kartami z wierzchu talii bohaterów
function refillHq(state: GameState): void {
  for (let i = 0; i < state.hq.length; i++) {
    if (state.hq[i] === null) {
      state.hq[i] = state.heroDeck.pop() ?? null
    }
  }
}

export function recruitHero(state: GameState, instanceId: string): void {
  assertPlaying(state)
  const index = state.hq.findIndex((c) => c?.instanceId === instanceId)
  if (index === -1) throw new Error(`Karty ${instanceId} nie ma w HQ`)

  const instance = state.hq[index]!
  const cost = state.cards[instance.cardId].cost ?? 0
  if (state.recruit < cost) {
    throw new Error(`Za mało recruit: masz ${state.recruit}, koszt ${cost}`)
  }

  state.recruit -= cost
  state.discard.push(instance) // kupiona karta trafia na stos odrzuconych
  state.hq[index] = null
  refillHq(state) // puste miejsce zapełnia się od razu
}

// ---------- Walka ----------

// Usuwa złoczyńcę z miasta: trafia do stosu zwycięstwa razem z uratowanymi bystanderami
function removeVillainFromCity(state: GameState, index: number): void {
  const villain = state.city[index]!
  state.defeated.push(villain)
  state.city[index] = null

  const rescued = state.captives[villain.instanceId] ?? []
  state.defeated.push(...rescued)
  delete state.captives[villain.instanceId]
}

export function fightVillain(state: GameState, instanceId: string): void {
  assertPlaying(state)
  const index = state.city.findIndex((c) => c?.instanceId === instanceId)
  if (index === -1) throw new Error(`Złoczyńcy ${instanceId} nie ma w mieście`)

  const strength = state.cards[state.city[index]!.cardId].strength ?? 0
  if (state.attack < strength) {
    throw new Error(`Za mało attack: masz ${state.attack}, siła ${strength}`)
  }

  state.attack -= strength
  removeVillainFromCity(state, index)
}

// Pokonuje złoczyńcę bez płacenia attack (np. efekt Silent Sniper)
export function defeatVillainFree(state: GameState, instanceId: string): void {
  const index = state.city.findIndex((c) => c?.instanceId === instanceId)
  if (index === -1) throw new Error(`Złoczyńcy ${instanceId} nie ma w mieście`)
  removeVillainFromCity(state, index)
}

async function claimTactic(state: GameState, ui: UiAdapter): Promise<void> {
  const tactic = state.tactics.pop()
  if (!tactic) throw new Error("Mastermind jest już pokonany")

  const ability = getCardAbility(tactic.cardId)
  if (ability) {
    await ability(state, { self: tactic, ui })
  }

  state.defeated.push(tactic)
  if (state.tactics.length === 0) {
    state.status = 'won'
    // TODO: Master Strike powinien rozpatrzyć się TUTAJ, przed wygraną
  }
}

export async function fightMastermind(state: GameState, ui: UiAdapter): Promise<void> {
  assertPlaying(state)
  const strength = state.cards[state.mastermind.cardId].strength ?? 0
  if (state.attack < strength) {
    throw new Error(`Za mało attack: masz ${state.attack}, siła ${strength}`)
  }

  state.attack -= strength
  await claimTactic(state, ui)
}

// Zdobywa taktykę bez płacenia attack (np. efekt Silent Sniper)
export async function claimTacticFree(state: GameState, ui: UiAdapter): Promise<void> {
  await claimTactic(state, ui)
}

// ---------- Rany i bystanderzy ----------

// Zdobywa ranę: ze stosu ran na stos odrzuconych gracza
export function gainWound(state: GameState): void {
  const wound = state.wounds.pop()
  if (!wound) return // stos pusty. TODO: sprawdź w instrukcji, czy coś się wtedy dzieje
  state.discard.push(wound)
}

// Ratuje bystandera: ze stosu bystanderów do stosu zwycięstwa
export function rescueBystander(state: GameState): void {
  const bystander = state.bystanders.pop()
  if (bystander) state.defeated.push(bystander)
}

// Bystander z talii złoczyńców trafia do złoczyńcy najbliższego Bridge'a
function captureBystander(state: GameState, bystander: CardInstance): void {
  for (let i = state.city.length - 1; i >= 0; i--) {
    const villain = state.city[i]
    if (villain) {
      const list = state.captives[villain.instanceId] ?? []
      list.push(bystander)
      state.captives[villain.instanceId] = list
      return
    }
  }
  // W mieście nikogo nie ma. TODO: sprawdź w instrukcji. Na razie idzie na KO
  state.ko.push(bystander)
}

// ---------- Scheme i warunki końca gry ----------

function resolveTwist(state: GameState, twist: CardInstance): void {
  state.twistsRevealed += 1
  console.log(`Scheme Twist #${state.twistsRevealed}`)
  getScheme(state).onTwist?.(state, state.twistsRevealed)
  state.ko.push(twist) // TODO: sprawdź w instrukcji, dokąd trafia Twist po rozpatrzeniu
}

function checkEndConditions(state: GameState): void {
  if (state.status !== 'playing') return

  const scheme = getScheme(state)
  const limit = scheme.escapeLimit ?? ESCAPE_LIMIT

  if (state.escaped.length >= limit || scheme.checkLoss?.(state)) {
    state.status = 'lost'
  }
}