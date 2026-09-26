import type { GameState, CardInstance, CardData } from './types'
import type { UiAdapter } from './ui'
import { getDiscardReplacement } from './replacements'
import { getVpModifier } from './vpModifiers'

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
    ((data.team ?? []).includes('S.H.I.E.L.D.') && !!data.type)
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
  return [...state.deck, ...state.hand, ...state.played, ...state.discard]
}

export function koCard(state: GameState, instanceId: string): void {
  for (const pile of [state.hand, state.discard, state.played]) {
    const index = pile.findIndex((c) => c.instanceId === instanceId)
    if (index !== -1) {
      const [card] = pile.splice(index, 1)
      state.ko.push(card)
      return
    }
  }
}

export async function discardCard(
  state: GameState,
  instanceId: string,
  ui: UiAdapter,
): Promise<void> {
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

export function haveCards(state: GameState, filter: CardFilter = {}): CardInstance[] {
  return haveZone(state).filter((c) => matchesFilter(state, c, filter))
}

export function revealCards(state: GameState, filter: CardFilter = {}): CardInstance[] {
  return revealZone(state).filter((c) => matchesFilter(state, c, filter))
}

export function hasCard(state: GameState, filter: CardFilter): boolean {
  return haveCards(state, filter).length > 0
}

export function canReveal(state: GameState, filter: CardFilter): boolean {
  return revealCards(state, filter).length > 0
}

// Efektywna siła złoczyńcy/mastermina/henchmana: normalnie stałe `strength`,
// ale jeśli ma przypiętą kartę (np. Skrull Queen Veranke), to jego Attack = koszt tej karty.
export function getEffectiveStrength(
  state: GameState,
  instance: { instanceId: string; cardId: string },
): number | undefined {
  const attached = state.attachedCards[instance.instanceId]
  if (attached) return state.cards[attached.cardId].cost ?? 0
  return state.cards[instance.cardId].strength
}

// Wszystkie karty "złapane" przez villaina/mastermind: jeńcy-bystanderzy + ewentualna
// przypięta karta bohatera (Skrull Queen Veranke, Skrull Shapeshifters).
export function getCapturedCards(state: GameState, instanceId: string): CardData[] {
  const captives = state.captives[instanceId] ?? []
  const attached = state.attachedCards[instanceId]
  return [...captives, ...(attached ? [attached] : [])].map((c) => state.cards[c.cardId])
}