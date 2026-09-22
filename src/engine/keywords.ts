import type { GameState, CardInstance } from './types'

// ---------- Zapytania ----------

// Ile kart danego typu/drużyny zagrano WCZEŚNIEJ w tej turze
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

// ---------- Akcje ----------

// Usuwa kartę z ręki, stosu odrzuconych lub zagranych i wysyła ją na KO
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

export function sumVictoryPoints(state: GameState, pile: CardInstance[]): number {
  return pile.reduce((total, c) => total + (state.cards[c.cardId].vp ?? 0), 0)
}