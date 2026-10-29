import type { GameState, CardInstance, CardData } from './types'
import type { UiAdapter } from './ui'
import { getDiscardReplacement, getDiscardShields, isEnemyEffect } from './replacements'
import { getVpModifier } from './vpModifiers'
import { CITY_NAMES } from './constants'
import { getScheme } from './schemeRegistry'
import { addRecruit } from './resources'
import { getMastermindRule } from './mastermindRules'
import { takeTopCards } from './deckOps'
import { getStrengthModifier } from './strengthModifiers'
import { shardAttackBonus } from './shards'


export function countPlayedThisTurn(
  state: GameState,
  filter: { type?: string; team?: string },
): number {
  return state.cardsPlayedThisTurn.filter((instance) => {
    const { type, team } = effectiveTypeTeam(state, instance)
    if (filter.type && !type.includes(filter.type)) return false
    if (filter.team && !team.includes(filter.team)) return false
    return true
  }).length
}

// Dystynktywni (po "hero") INNI bohaterowie zagrani w tej turze, pasujący do filtra.
export function countDistinctHeroesPlayedThisTurn(
  state: GameState,
  filter: { type?: string; team?: string },
  excludeInstanceId: string,
): number {
  const heroes = new Set<string>()
  for (const instance of state.cardsPlayedThisTurn) {
    if (instance.instanceId === excludeInstanceId) continue
    const data = state.cards[instance.cardId]
    const { type, team } = effectiveTypeTeam(state, instance)
    if (filter.type && !type.includes(filter.type)) continue
    if (filter.team && !team.includes(filter.team)) continue
    if (data.hero) heroes.add(data.hero)
  }
  return heroes.size
}
export function countBystandersInPile(state: GameState, pile: CardInstance[]): number {
  return pile.filter((c) => state.cards[c.cardId].kind === 'bystander').length
}

export function hasCaptiveBystander(state: GameState, instance: CardInstance): boolean {
  return (state.captives[instance.instanceId]?.length ?? 0) > 0
}

export function isShieldHero(data: CardData): boolean {
  return (
    data.hero === 'S.H.I.E.L.D. Agent' ||
    data.hero === 'S.H.I.E.L.D. Trooper' ||
    (data.team ?? []).includes('S.H.I.E.L.D.')
  )
}

export function countDistinctTeams(state: GameState, pile: CardInstance[]): number {
  const teams = new Set<string>()
  for (const c of pile) {
    for (const t of state.cards[c.cardId].team ?? []) teams.add(t)
  }
  return teams.size
}

// "każdy kolor bohatera" = liczba różnych TYPÓW (nie drużyn) wśród kart w danym stosie
export function countDistinctTypes(state: GameState, pile: CardInstance[]): number {
  const types = new Set<string>()
  for (const c of pile) {
    for (const t of state.cards[c.cardId].type ?? []) types.add(t)
  }
  return types.size
}

export function sumVictoryPoints(state: GameState, pile: CardInstance[]): number {
  return pile.reduce((total, c) => {
    const base = state.cards[c.cardId].vp ?? 0
    const modifier = getVpModifier(c.cardId)
    return total + base + (modifier ? modifier(state, c, pile) : 0)
  }, 0)
}

// Wynik końcowy: punkty VP minus kary (-4 za bystandera porwanego przez uciekiniera,
// -3 za każdy Scheme Twist, -1 za każdego uciekiniera).
// Wynik końcowy: punkty VP minus kary (-4 za bystandera porwanego przez uciekiniera,
// -3 za każdy Scheme Twist, -1 za każdego uciekiniera).
export function finalScore(state: GameState, pile: CardInstance[]): number {
  return (
    sumVictoryPoints(state, pile) -
    4 * state.escapedBystanders.length -
    3 * state.twistsRevealed -
    state.escaped.length
  )
}

// DECK + HAND + PLAYED + DISCARD = wszystkie karty, które gracz aktualnie posiada
export function allOwnedCards(state: GameState): CardInstance[] {
  return [...state.deck, ...state.hand, ...state.played, ...state.discard, ...(state.teleported ?? []), ...(state.artifacts ?? [])]
}

export function koCard(state: GameState, instanceId: string): void {
  for (const pile of [state.hand, state.discard, state.played, state.deck, state.artifacts ?? []]) {
    const index = pile.findIndex((c) => c.instanceId === instanceId)
    if (index !== -1) {
      const [card] = pile.splice(index, 1)
      state.ko.push(card)
      if (state.koRecruitBonus) addRecruit(state, state.koRecruitBonus)
      return
    }
  }
}

export async function discardCard(
  state: GameState,
  instanceId: string,
  ui: UiAdapter,
): Promise<void> {
  // Efekt przeciwnika: tarcze (Impenetrable Ice Wall) mogą anulować odrzucenie
  if (isEnemyEffect(state)) {
    for (const [shieldId, shield] of getDiscardShields()) {
      const holder = state.hand.find((c) => c.cardId === shieldId)
      if (holder && (await shield(state, ui, holder))) return
    }
  }

  for (const pile of [state.hand, state.played, state.artifacts ?? []]) {
    const index = pile.findIndex((c) => c.instanceId === instanceId)
    if (index === -1) continue

    const card = pile[index]
    const replacement = getDiscardReplacement(card.cardId)
    if (replacement) {
      const replaced = await replacement(state, ui, card)
      if (replaced) return
    }

    pile.splice(index, 1)
    state.discard.push(card)
    return
  }
}

export type CardFilter = { type?: string; team?: string; hero?: string; artifact?: boolean }

function effectiveTypeTeam(state: GameState, instance: CardInstance): { type: string[]; team: string[] } {
  const data = state.cards[instance.cardId]
  const copiedId = state.copiedCardIds?.[instance.instanceId]
  const copied = copiedId ? state.cards[copiedId] : undefined
  return {
    type: [...(data.type ?? []), ...(copied?.type ?? [])],
    team: [...(data.team ?? []), ...(copied?.team ?? [])],
  }
}

function matchesFilter(state: GameState, instance: CardInstance, filter: CardFilter): boolean {
  const data = state.cards[instance.cardId]
  if (data.kind === 'wound') return false
  if (filter.artifact && !isArtifactData(data)) return false
  const { type, team } = effectiveTypeTeam(state, instance)
  if (filter.type && !type.includes(filter.type)) return false
  if (filter.team && !team.includes(filter.team)) return false
  if (filter.hero && data.hero !== filter.hero) return false
  return true
}

// HAVE = ręka + zagrane + discard + Artifacty pod kontrolą
export function haveZone(state: GameState): CardInstance[] {
  return [...state.hand, ...state.played, ...state.discard, ...(state.artifacts ?? [])]
}

// REVEAL = ręka + zagrane + Artifacty pod kontrolą (bez discardu)
export function revealZone(state: GameState): CardInstance[] {
  return [...state.hand, ...state.played, ...(state.artifacts ?? [])]
}

// PLAYED = karty leżące w "played" (w przeciwieństwie do revealZone, NIE liczy ręki)
// + Artifacty wyłożone w TEJ turze (stary Artifact nie jest "zagrany" w tej turze)
export function playedZone(state: GameState): CardInstance[] {
  const artifactsPlayedNow = (state.artifacts ?? []).filter((a) =>
    state.cardsPlayedThisTurn.some((c) => c.instanceId === a.instanceId),
  )
  return [...state.played, ...artifactsPlayedNow]
}

export function haveCards(state: GameState, filter: CardFilter = {}): CardInstance[] {
  return haveZone(state).filter((c) => matchesFilter(state, c, filter))
}

export function revealCards(state: GameState, filter: CardFilter = {}): CardInstance[] {
  return revealZone(state).filter((c) => matchesFilter(state, c, filter))
}

export function playedCards(state: GameState, filter: CardFilter = {}): CardInstance[] {
  return playedZone(state).filter((c) => matchesFilter(state, c, filter))
}

export function hasCard(state: GameState, filter: CardFilter): boolean {
  return haveCards(state, filter).length > 0
}

export function canReveal(state: GameState, filter: CardFilter): boolean {
  return revealCards(state, filter).length > 0
}

export function hasPlayedCard(state: GameState, filter: CardFilter): boolean {
  return playedCards(state, filter).length > 0
}

export function mostRecentHeroPlayed(state: GameState): CardInstance | undefined {
  return [...state.cardsPlayedThisTurn].reverse().find((card) => !!state.cards[card.cardId].hero)
}

export function matchesRampageCharacter(
  state: GameState,
  instance: CardInstance,
  character: string,
): boolean {
  const data = state.cards[instance.cardId]
  const names = [data.name, data.hero ?? ''].map((name) => name.toLowerCase())
  const characterName = character.toLowerCase()
  const aliases =
    characterName === 'hulk'
      ? ['hulk', 'maestro', 'nul, breaker of worlds']
      : characterName === 'wolverine'
        ? ['wolverine', 'weapon x', 'old man logan']
        : [characterName]
  return names.some((name) => aliases.some((alias) => name.includes(alias)))
}

/** Cosmic Threat (jedna klasa, np. Heraldowie): -3 Attack za każdą kartę tej klasy w ręce i zagranych.
 * Karty z kilkoma klasami (Galactus) wymagają wyboru gracza, więc obsługuje je jego reguła Mastermina. */
export function cosmicThreatReduction(state: GameState, instance: { cardId: string }): number {
  const classes = state.cards[instance.cardId].cosmicThreat
  if (!classes || classes.length !== 1) return 0
  return 3 * revealCards(state, { type: classes[0] }).length
}

// Efektywna siła złoczyńcy/mastermina/henchmana: bazowe `strength` (albo koszt przypiętej karty),
// plus modyfikatory lokacji/mastermina na tę turę, plus ewentualny bonus zdefiniowany przez Scheme.
export function getEffectiveStrength(
  state: GameState,
  instance: { instanceId: string; cardId: string },
): number | undefined {
  const attached = state.attachedCards[instance.instanceId]
  let base = attached ? state.cards[attached.cardId].cost ?? 0 : state.cards[instance.cardId].strength

  const baseOverride = getScheme(state).villainBaseStrengthOverride?.(state, instance)
  if (baseOverride !== undefined) base = baseOverride

  const cardStrengthModifier = getStrengthModifier(instance.cardId)
  // Dynamic Villains such as Doppelganger have no printed Strength. Their
  // card-specific modifier supplies the complete current value.
  if (base === undefined && !cardStrengthModifier) return undefined

  let total = base ?? 0

  const isMastermind = (state.masterminds ?? [state.mastermind]).some(
    (mastermind) => mastermind.instanceId === instance.instanceId,
  )
  if (isMastermind) {
    total += instance.instanceId === state.mastermind.instanceId
      ? state.mastermindAttackModifierThisTurn
      : state.mastermindAttackModifiers?.[instance.instanceId] ?? 0
    total += state.counters['Dark Portal (Mastermind)'] ?? 0
  } else {
    const cityIndex = state.city.findIndex((c) => c?.instanceId === instance.instanceId)
    if (cityIndex !== -1) {
      const location = CITY_NAMES[cityIndex]
      total += state.locationAttackModifiers[location] ?? 0
      total += state.cityMarkers[cityIndex].filter((m) => m === 'Dark Portal').length
    }
  }

  total += getScheme(state).villainStrengthModifier?.(state, instance) ?? 0
  for (const mastermind of state.masterminds ?? [state.mastermind]) {
    total += getMastermindRule(state, mastermind)?.villainStrengthModifier?.(state, instance) ?? 0
  }
  total += cardStrengthModifier?.(state, instance) ?? 0
  total += shardAttackBonus(state, instance)
  total -= cosmicThreatReduction(state, instance)

  return Math.max(0, total) // siła nie może zejść poniżej 0 (inaczej spendAttack by ją "zwracał")
}

// Wszystkie karty "złapane" przez villaina/mastermind: jeńcy-bystanderzy + ewentualna
// przypięta karta bohatera (Skrull Queen Veranke, Skrull Shapeshifters).
export function getCapturedCards(state: GameState, instanceId: string): CardData[] {
  const captives = state.captives[instanceId] ?? []
  const attached = state.attachedCards[instanceId]
  return [...captives, ...(attached ? [attached] : [])].map((c) => state.cards[c.cardId])
}

/** Odrzuca kartę i zwraca true, jeśli faktycznie opuściła rękę/zagrane (efekt zastępczy mógł ją zatrzymać). */
export async function discardCardChecked(
  state: GameState,
  instanceId: string,
  ui: UiAdapter,
): Promise<boolean> {
  await discardCard(state, instanceId, ui)
  return (
    !state.hand.some((c) => c.instanceId === instanceId) &&
    !state.played.some((c) => c.instanceId === instanceId) &&
    !(state.artifacts ?? []).some((c) => c.instanceId === instanceId)
  )
}

/** "You may KO a card from your hand or discard pile". */
export async function koFromHandOrDiscard(state: GameState, ui: UiAdapter, prompt: string): Promise<void> {
  const options = [...state.hand, ...state.discard]
  if (options.length === 0) return
  const chosen = await ui.choose(options, { prompt, optional: true })
  if (chosen) koCard(state, chosen.instanceId)
}

export function isVillainCard(data: CardData): boolean {
  return data.villainGroup !== undefined || data.henchman === true
}

export function isArtifactData(data: CardData): boolean {
  return (data.keywords ?? []).includes('artifact')
}

/** Artifacty pod kontrolą gracza, opcjonalnie przefiltrowane (typ, drużyna, bohater). */
export function artifactCards(state: GameState, filter: CardFilter = {}): CardInstance[] {
  return (state.artifacts ?? []).filter((c) => matchesFilter(state, c, filter))
}

export function villainsIn(state: GameState, pile: CardInstance[]): CardInstance[] {
  return pile.filter((c) => isVillainCard(state.cards[c.cardId]))
}

/** KO karty ze stosu Victory. To nie karta gracza, więc bez bonusu koRecruitBonus (Absorb Energies). */
export function koFromVictoryPile(state: GameState, instanceId: string): void {
  const index = state.defeated.findIndex((c) => c.instanceId === instanceId)
  if (index === -1) return
  const [card] = state.defeated.splice(index, 1)
  state.ko.push(card)
}

/** Zdejmuje `count` kart z wierzchu talii gracza i pokazuje każdą z osobna. Zwraca odkryte karty. */
export async function revealTopCards(
  state: GameState,
  ui: UiAdapter,
  count: number,
  label: string,
): Promise<CardInstance[]> {
  const cards = takeTopCards(state, count)
  for (let i = 0; i < cards.length; i++) {
    await ui.revealCard(cards[i], `${label}: revealed card ${i + 1}/${cards.length}`)
  }
  return cards
}
