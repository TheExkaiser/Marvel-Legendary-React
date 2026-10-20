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

// DECK + HAND + PLAYED + DISCARD = wszystkie karty, które gracz aktualnie posiada
export function allOwnedCards(state: GameState): CardInstance[] {
  return [...state.deck, ...state.hand, ...state.played, ...state.discard, ...(state.teleported ?? [])]
}

export function koCard(state: GameState, instanceId: string): void {
  for (const pile of [state.hand, state.discard, state.played, state.deck]) {
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

  for (const pile of [state.hand, state.played]) {
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

export type CardFilter = { type?: string; team?: string; hero?: string }

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
  const { type, team } = effectiveTypeTeam(state, instance)
  if (filter.type && !type.includes(filter.type)) return false
  if (filter.team && !team.includes(filter.team)) return false
  if (filter.hero && data.hero !== filter.hero) return false
  return true
}

// HAVE = ręka + zagrane + discard
export function haveZone(state: GameState): CardInstance[] {
  return [...state.hand, ...state.played, ...state.discard]
}

// REVEAL = ręka + zagrane (bez discardu)
export function revealZone(state: GameState): CardInstance[] {
  return [...state.hand, ...state.played]
}

// PLAYED = tylko karty aktualnie leżące w "played" (w przeciwieństwie do revealZone, NIE liczy ręki)
export function playedZone(state: GameState): CardInstance[] {
  return [...state.played]
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

  if (base === undefined) return undefined

  let total = base

  if (instance.instanceId === state.mastermind.instanceId) {
    total += state.mastermindAttackModifierThisTurn
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
  total += getMastermindRule(state)?.villainStrengthModifier?.(state, instance) ?? 0
  total += getStrengthModifier(instance.cardId)?.(state, instance) ?? 0

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
    !state.played.some((c) => c.instanceId === instanceId)
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
