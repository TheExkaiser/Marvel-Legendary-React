import type { GameState, CardInstance } from './types'

export function countPlayedThisTurn(
  state: GameState,
  filter: { type?: string; team?: string },
): number {
  return state.cardsPlayedThisTurn.filter((instance) => {
    const data = state.cards[instance.cardId]
    if (filter.type && !(data.type ?? []).includes(filter.type)) return false
    if (filter.team && !(data.team ?? []).includes(filter.team)) return false
    return true
  }).length
}

export function countBystandersInPile(state: GameState, pile: CardInstance[]): number {
  return pile.filter((c) => state.cards[c.cardId].kind === 'bystander').length
}

export function hasCaptiveBystander(state: GameState, instance: CardInstance): boolean {
  return (state.captives[instance.instanceId]?.length ?? 0) > 0
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
  return pile.reduce((total, c) => total + (state.cards[c.cardId].vp ?? 0), 0)
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

export function discardCard(state: GameState, instanceId: string): void {
  for (const pile of [state.hand, state.played]) {
    const index = pile.findIndex((c) => c.instanceId === instanceId)
    if (index !== -1) {
      const [card] = pile.splice(index, 1)
      state.discard.push(card)
      return
    }
  }
}