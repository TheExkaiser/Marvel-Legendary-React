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

/** Aktualny koszt karty w polu HQ po odjęciu pozostałej jednorazowej puli Recruit (Underground Riches), nie mniej niż 0.
 * Pole HQ o indeksie i leży pod polem miasta CITY_NAMES[i]. */
export function hqCardCost(state: GameState, index: number): number {
  const instance = state.hq[index]
  if (!instance) return 0
  const data = state.cards[instance.cardId]
  if (data.kind === 'bystander') return BYSTANDER_RESCUE_COST
  if (!data.hero) return data.cost ?? 0
  const bonus = state.hqRecruitBonuses?.[CITY_NAMES[index]] ?? 0
  return Math.max(0, (data.cost ?? 0) - bonus)
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
  const baseCost = data.cost ?? 0
  const cost = hqCardCost(state, index)
  if (state.recruit < cost) {
    throw new Error(`Za mało recruit: masz ${state.recruit}, koszt ${cost}`)
  }

  state.recruit -= cost
  if (!isBystander && data.hero) {
    const location = CITY_NAMES[index]
    const remainingBonus = state.hqRecruitBonuses?.[location] ?? 0
    if (remainingBonus > 0) {
      state.hqRecruitBonuses = { ...state.hqRecruitBonuses, [location]: Math.max(0, remainingBonus - baseCost) }
    }
  }
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
