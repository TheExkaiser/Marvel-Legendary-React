import type { GameState } from './types'
import { assertPlaying } from './common'

/** Uzupełnia puste sloty HQ z talii bohaterów. */
export function refillHq(state: GameState): void {
  for (let i = 0; i < state.hq.length; i++) {
    if (state.hq[i] === null) {
      state.hq[i] = state.heroDeck.pop() ?? null
    }
  }
}

/** Kupuje bohatera z HQ (płaci recruit), karta trafia do stosu odrzuconych. */
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

/** Kupuje S.H.I.E.L.D. Officera ze stosu oficerów. */
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
