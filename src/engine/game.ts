import type { GameState, GameSetup, CardData, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { registerScheme, getScheme } from './schemeRegistry'
import { getCardAbility } from './cardAbilities'
import { getWoundReplacement } from './replacements'
import { canPlayCard } from './cardRequirements'
import { getVillainAbilities } from './villainAbilities'
import { canDefeatVillain } from './villainRequirements'
import { buildDeck } from './deck'
import { shuffle } from './random'

const HAND_SIZE = 6
const ESCAPE_LIMIT = 3 // TEST: sprawdź w instrukcji

function assertPlaying(state: GameState): void {
  if (state.status !== 'playing') throw new Error('Gra jest już zakończona')
}

function logEvent(state: GameState, message: string): void {
  state.log.push(message)
  console.log(message)
}

// ---------- Przygotowanie gry ----------

export function createGameState(setup: GameSetup): GameState {
  const { startingCards, heroCards, villainCards, mastermind, scheme } = setup
  registerScheme(scheme)

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
    cards[card.id] = card
  }

  const bystanders = shuffle(buildDeck([setup.bystanders]))
  const bystandersForVillainDeck = bystanders.splice(0, setup.bystandersInVillainDeck)
  const twists = buildDeck([{ card: setup.twist, count: scheme.twistCount }])
  const masterStrikes = buildDeck([
    { card: setup.masterStrikeCard, count: setup.masterStrikeCount },
  ])

  const state: GameState = {
    cards,
    deck: shuffle(buildDeck(startingCards)),
    hand: [],
    played: [],
    discard: [],
    cardsPlayedThisTurn: [],
    heroDeck: shuffle(buildDeck(heroCards)),
    hq: [null, null, null, null, null],
    officerDeck: shuffle(buildDeck([setup.officerCards])),
    officerCardId: setup.officerCards.card.id,
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
    wounds: buildDeck([setup.wounds]),
    bystanders,
    captives: {},
    ko: [],
    mastermind: { instanceId: mastermind.card.id, cardId: mastermind.card.id },
    tactics: shuffle(
      mastermind.tactics.map((t) => ({ instanceId: t.id, cardId: t.id })),
    ),
    masterStrikeId: mastermind.masterStrikeId,
    schemeId: scheme.id,
    counters: {},
    twistsRevealed: 0,
    log: [],
    attack: 0,
    recruit: 0,
    turn: 1,
    extraTurnsQueued: 0,
    bonusDrawNextTurn: 0,
    status: 'playing',
  }

  refillHq(state)
  scheme.setup?.(state)
  return state
}

export async function startGame(state: GameState, ui: UiAdapter): Promise<void> {
  drawCards(state, HAND_SIZE)
  await villainPhase(state, ui)
}

// ---------- Ręka i talia gracza ----------

export function drawCards(state: GameState, count: number): void {
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) {
      if (state.discard.length === 0) return
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

  const cardId = state.hand[index].cardId
  const data = state.cards[cardId]
  if (data.kind === 'wound') throw new Error('Rany nie da się zagrać')
  if (!canPlayCard(state, cardId)) {
    throw new Error('Nie można zagrać tej karty: nie da się zapłacić jej kosztu')
  }

  const [instance] = state.hand.splice(index, 1)
  state.played.push(instance)
  state.attack += data.attack ?? 0
  state.recruit += data.recruit ?? 0

  const ability = getCardAbility(instance.cardId)
  if (ability) {
    await ability(state, { self: instance, ui })
  }

  state.cardsPlayedThisTurn.push(instance)
}

export async function endTurn(state: GameState, ui: UiAdapter): Promise<void> {
  assertPlaying(state)

  state.discard.push(...state.hand, ...state.played)
  state.hand = []
  state.played = []
  state.cardsPlayedThisTurn = []
  state.attack = 0
  state.recruit = 0

  const drawAmount = HAND_SIZE + state.bonusDrawNextTurn
  state.bonusDrawNextTurn = 0

  if (state.extraTurnsQueued > 0) {
    state.extraTurnsQueued -= 1
    drawCards(state, drawAmount)
  } else {
    state.turn += 1
    drawCards(state, drawAmount)
    await villainPhase(state, ui)
  }
}

// ---------- Faza złoczyńcy, miasto, Master Strike ----------

export async function villainPhase(state: GameState, ui: UiAdapter): Promise<void> {
  const card = state.villainDeck.pop()
  if (!card) return

  const data = state.cards[card.cardId]
  logEvent(state, `Tura ${state.turn}: odkryto ${data.name}`)

  if (data.kind === 'bystander') {
    captureBystander(state, card)
  } else if (data.kind === 'twist') {
    resolveTwist(state, card)
  } else if (data.kind === 'masterstrike') {
    await resolveMasterStrike(state, card, ui)
  } else {
    await enterCity(state, card, ui)
  }

  checkEndConditions(state)
}

async function resolveMasterStrike(
  state: GameState,
  card: CardInstance,
  ui: UiAdapter,
): Promise<void> {
  await ui.showInfo(card, 'Odkryto: Master Strike!')

  const ability = getCardAbility(state.masterStrikeId)
  if (ability) {
    await ability(state, { self: card, ui })
  }

  state.ko.push(card)
}

async function enterCity(state: GameState, villain: CardInstance, ui: UiAdapter): Promise<void> {
  let moving: CardInstance | null = villain

  for (let i = state.city.length - 1; i >= 0 && moving; i--) {
    const occupant: CardInstance | null = state.city[i]
    state.city[i] = moving
    moving = occupant
  }

  if (moving) {
    state.escaped.push(moving)
    logEvent(state, `Ucieka: ${state.cards[moving.cardId].name}`)

    const lost = state.captives[moving.instanceId] ?? []
    state.ko.push(...lost)
    delete state.captives[moving.instanceId]

    getScheme(state).onVillainEscaped?.(state, moving)

    const abilities = getVillainAbilities(moving.cardId)
    if (abilities?.onEscape) {
      await abilities.onEscape(state, ui, moving)
    }
  }

  getScheme(state).onVillainEntered?.(state, villain)

  const abilities = getVillainAbilities(villain.cardId)
  if (abilities?.onAmbush) {
    await abilities.onAmbush(state, ui, villain)
  }
}

// ---------- HQ, oficerowie i kupowanie ----------

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
  state.discard.push(instance)
  state.hq[index] = null
  refillHq(state)
}

export function recruitOfficer(state: GameState): void {
  assertPlaying(state)
  const data = state.cards[state.officerCardId]
  const cost = data.cost ?? 0
  if (state.recruit < cost) {
    throw new Error(`Za mało recruit: masz ${state.recruit}, koszt ${cost}`)
  }

  const instance = state.officerDeck.pop()
  if (!instance) throw new Error('Brak dostępnych oficerów')

  state.recruit -= cost
  state.discard.push(instance)
}

// ---------- Walka ----------

function removeVillainFromCity(state: GameState, index: number): void {
  const villain = state.city[index]!
  state.defeated.push(villain)
  state.city[index] = null

  const rescued = state.captives[villain.instanceId] ?? []
  state.defeated.push(...rescued)
  delete state.captives[villain.instanceId]
}

export async function fightVillain(
  state: GameState,
  instanceId: string,
  ui: UiAdapter,
): Promise<void> {
  assertPlaying(state)
  const index = state.city.findIndex((c) => c?.instanceId === instanceId)
  if (index === -1) throw new Error(`Złoczyńcy ${instanceId} nie ma w mieście`)

  const villain = state.city[index]!
  if (!canDefeatVillain(state, villain.cardId)) {
    throw new Error('Nie możesz teraz pokonać tego złoczyńcy (niespełniony warunek)')
  }

  const strength = state.cards[villain.cardId].strength ?? 0
  if (state.attack < strength) {
    throw new Error(`Za mało attack: masz ${state.attack}, siła ${strength}`)
  }

  state.attack -= strength

  const abilities = getVillainAbilities(villain.cardId)
  if (abilities?.onFight) {
    await abilities.onFight(state, ui, villain)
  }

  removeVillainFromCity(state, index)
}

// Darmowe pokonanie (np. Silent Sniper) - respektuje warunek pokonania, ale NIE odpala "Fight"
export function defeatVillainFree(state: GameState, instanceId: string): void {
  const index = state.city.findIndex((c) => c?.instanceId === instanceId)
  if (index === -1) throw new Error(`Złoczyńcy ${instanceId} nie ma w mieście`)

  const villain = state.city[index]!
  if (!canDefeatVillain(state, villain.cardId)) {
    throw new Error('Nie możesz teraz pokonać tego złoczyńcy (niespełniony warunek)')
  }

  removeVillainFromCity(state, index)
}

async function claimTactic(state: GameState, ui: UiAdapter): Promise<void> {
  const tactic = state.tactics.pop()
  if (!tactic) throw new Error('Mastermind jest już pokonany')

  await ui.showInfo(tactic, `Odkryto taktykę: ${state.cards[tactic.cardId].name}`)

  const ability = getCardAbility(tactic.cardId)
  if (ability) {
    await ability(state, { self: tactic, ui })
  }

  state.defeated.push(tactic)
  if (state.tactics.length === 0) {
    state.status = 'won'
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

export async function claimTacticFree(state: GameState, ui: UiAdapter): Promise<void> {
  await claimTactic(state, ui)
}

// ---------- Rany i bystanderzy ----------

export async function gainWound(state: GameState, ui: UiAdapter): Promise<void> {
  for (const card of [...state.hand, ...state.played]) {
    const replacement = getWoundReplacement(card.cardId)
    if (replacement) {
      const replaced = await replacement(state, ui, card)
      if (replaced) return
    }
  }
  gainWoundSilent(state)
}

export function gainWoundSilent(state: GameState): void {
  const wound = state.wounds.pop()
  if (!wound) return
  state.discard.push(wound)
}

export function rescueBystander(state: GameState): void {
  const bystander = state.bystanders.pop()
  if (bystander) state.defeated.push(bystander)
}

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
  state.ko.push(bystander)
}

// ---------- Scheme i warunki końca gry ----------

function resolveTwist(state: GameState, twist: CardInstance): void {
  state.twistsRevealed += 1
  logEvent(state, `Scheme Twist #${state.twistsRevealed}`)
  getScheme(state).onTwist?.(state, state.twistsRevealed)
  state.ko.push(twist)
}

function checkEndConditions(state: GameState): void {
  if (state.status !== 'playing') return

  const scheme = getScheme(state)
  const limit = scheme.escapeLimit ?? ESCAPE_LIMIT

  if (state.escaped.length >= limit || scheme.checkLoss?.(state)) {
    state.status = 'lost'
  }
}