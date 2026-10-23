import type { GameState, CardInstance } from './types'
import { assertPlaying } from './common'
import { getScheme } from './schemeRegistry'
import { rescueCard } from './wounds'
import { CITY_NAMES } from './constants'

/** Save Humanity: za tyle Recruit ratujesz Bystandera z HQ. */
const BYSTANDER_RESCUE_COST = 2

/** Uzupełnia puste sloty HQ z talii bohaterów (zniszczone miejsca, np. w Detonate the Helicarrier, zostają puste). */
export function refillHq(state: GameState): void {
  for (let i = 0; i < state.hq.length; i++) {
    if (state.hq[i] === null && !state.hqDestroyed?.[i]) {
      state.hq[i] = state.heroDeck.pop() ?? null
    }
  }
}

/** KO bohatera z HQ. Miejsce zostaje puste (uzupełnia je wywołujący przez refillHq).
 * Scheme może przejąć kartę (onHeroKoedFromHq), inaczej idzie do KO. */
export function koFromHq(state: GameState, index: number): CardInstance | undefined {
  const card = state.hq[index]
  if (!card) return undefined
  state.hq[index] = null

  const scheme = getScheme(state)
  if (scheme.onHeroKoedFromHq) scheme.onHeroKoedFromHq(state, card, index)
  else state.ko.push(card)
  return card
}

/** Zrekrutowana karta trafia do odrzuconych. Silent Meditation: do ręki, Backflip: na wierzch talii. */
function placeRecruitedCard(state: GameState, instance: CardInstance): void {
  if ((state.recruitsToHand ?? 0) > 0) {
    state.recruitsToHand! -= 1
    state.hand.push(instance)
  } else if ((state.recruitsToDeckTop ?? 0) > 0) {
    state.recruitsToDeckTop! -= 1
    state.deck.push(instance) // wierzch talii to koniec tablicy
  } else {
    state.discard.push(instance)
  }
}

/** Kupuje bohatera z HQ (płaci recruit), karta trafia do stosu odrzuconych.
 * Bystander w HQ (Save Humanity) kosztuje 2 Recruit i jest ratowany do Victory Pool. */
export function recruitHero(state: GameState, instanceId: string): void {
  assertPlaying(state)
  const index = state.hq.findIndex((c) => c?.instanceId === instanceId)
  if (index === -1) throw new Error(`Karty ${instanceId} nie ma w HQ`)

  const instance = state.hq[index]!
  const data = state.cards[instance.cardId]
  const isBystander = data.kind === 'bystander'
  const cost = isBystander ? BYSTANDER_RESCUE_COST : (data.cost ?? 0)

  // Underground Riches: Recruit tylko dla Bohaterów z jednego pola HQ (pole i leży pod CITY_NAMES[i]). Wydajemy go najpierw
  const location = CITY_NAMES[index]
  const slotPool = isBystander ? 0 : (state.hqSlotRecruit?.[location] ?? 0)
  const fromSlotPool = Math.min(slotPool, cost)
  if (state.recruit + fromSlotPool < cost) {
    throw new Error(`Za mało recruit: masz ${state.recruit + fromSlotPool}, koszt ${cost}`)
  }

  if (fromSlotPool > 0) state.hqSlotRecruit![location] = slotPool - fromSlotPool
  state.recruit -= cost - fromSlotPool
  state.hq[index] = null
  if (isBystander) rescueCard(state, instance)
  else placeRecruitedCard(state, instance)
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
  placeRecruitedCard(state, instance)
}
