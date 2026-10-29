import type { GameState, CardInstance } from './types'
import { assertPlaying, logEvent } from './common'
import { getScheme } from './schemeRegistry'
import { rescueCard } from './wounds'
import { CITY_NAMES } from './constants'
import type { UiAdapter } from './ui'
import { claimShardsOn, gainShards, returnShardsOn } from './shards'

/** Save Humanity: za tyle Recruit ratujesz Bystandera z HQ. */
const BYSTANDER_RESCUE_COST = 2

function heroesCostAttack(state: GameState): boolean {
  return (
    state.heroesCostAttackThisTurn ||
    (getScheme(state).id === 'fantasticfour_pull_reality_into_the_negative_zone' &&
      [2, 4, 6].includes(state.twistsRevealed))
  )
}

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
  returnShardsOn(state, card) // Shatterax: Bohater opuszcza HQ w inny sposób niż rekrutacja, Shardy wracają do zapasu

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

/** Czy gracza stać na kartę w polu HQ o danym indeksie. Te same warunki co w recruitHero, ale bez wykonywania akcji (podświetlanie w UI). */
export function canAffordHqCard(state: GameState, index: number): boolean {
  const instance = state.hq[index]
  if (!instance || state.status !== 'playing') return false
  const data = state.cards[instance.cardId]
  const payWithAttack = !!data.hero && heroesCostAttack(state)
  const available = payWithAttack ? state.attack : state.recruit
  return available >= hqCardCost(state, index)
}

/** Czy gracza stać na S.H.I.E.L.D. Officera. Te same warunki co w recruitOfficer. */
export function canAffordOfficer(state: GameState): boolean {
  if (state.status !== 'playing' || state.officerDeck.length === 0) return false
  const cost = state.cards[state.officerCardId].cost ?? 0
  const available = heroesCostAttack(state) ? state.attack : state.recruit
  return available >= cost
}

/** Kupuje bohatera z HQ (płaci recruit), karta trafia do stosu odrzuconych.
 * Bystander w HQ (Save Humanity) kosztuje 2 Recruit; samo ratowanie (async) robi recruitHeroWithUi. */
export function recruitHero(state: GameState, instanceId: string): void {
  assertPlaying(state)
  const index = state.hq.findIndex((c) => c?.instanceId === instanceId)
  if (index === -1) throw new Error(`Karty ${instanceId} nie ma w HQ`)

  const instance = state.hq[index]!
  const data = state.cards[instance.cardId]
  const isBystander = data.kind === 'bystander'
  const baseCost = data.cost ?? 0
  const cost = hqCardCost(state, index)
  const payWithAttack = !!data.hero && heroesCostAttack(state)
  const available = payWithAttack ? state.attack : state.recruit
  if (available < cost) {
    throw new Error(`Za mało ${payWithAttack ? 'attack' : 'recruit'}: masz ${available}, koszt ${cost}`)
  }

  if (payWithAttack) state.attack -= cost
  else state.recruit -= cost
  if (!isBystander && data.hero) {
    const location = CITY_NAMES[index]
    const remainingBonus = state.hqRecruitBonuses?.[location] ?? 0
    if (remainingBonus > 0) {
      state.hqRecruitBonuses = { ...state.hqRecruitBonuses, [location]: Math.max(0, remainingBonus - baseCost) }
    }
  }
  if (!isBystander && data.hero) claimShardsOn(state, instance) // Shatterax: Shardy leżące na Bohaterze trafiają do gracza
  if (!isBystander && data.hero && state.shardsOnNextRecruitThisTurn) {
    state.shardsOnNextRecruitThisTurn = false
    gainShards(state, baseCost) // I Am Groot: Shardy równe (drukowanemu) kosztowi zrekrutowanego Bohatera
  }
  state.hq[index] = null
  if (!isBystander) placeRecruitedCard(state, instance) // Bystandera ratuje recruitHeroWithUi: rescueCard jest async i wymaga ui
  logEvent(state, isBystander ? `Rescued: ${data.name}` : `Recruited: ${data.name}`)
  refillHq(state)
}

/** Rekrutacja z interfejsem UI. Obsługuje opcjonalny Wall-Crawl po normalnym
 * trafieniu Bohatera do discardu. Specjalne efekty, które "gaining" Bohatera,
 * nadal używają synchronicznego recruitHero i nie uruchamiają Wall-Crawl. */
export async function recruitHeroWithUi(state: GameState, instanceId: string, ui: UiAdapter): Promise<void> {
  const instance = state.hq.find((card) => card?.instanceId === instanceId)
  if (!instance) return recruitHero(state, instanceId)

  recruitHero(state, instanceId)
  const data = state.cards[instance.cardId]
  if (data.kind === 'bystander') {
    await rescueCard(state, instance, ui)
    return
  }
  const hasWallCrawl =
    (data.keywords ?? []).includes('wall-crawl') || getScheme(state).allHeroesHaveWallCrawl === true
  if (!data.hero || !hasWallCrawl) return

  const recruited = [...state.hand, ...state.discard].find((card) => card.instanceId === instanceId)
  if (!recruited) return
  const choice = await ui.chooseOptionWithCard(
    recruited,
    [
      { id: 'top', label: 'Put on top of deck' },
      { id: 'discard', label: 'Leave in discard pile' },
    ],
    `${data.name}: use Wall-Crawl and put this Hero on top of your deck?`,
  )
  if (choice !== 'top') return

  const handIndex = state.hand.findIndex((card) => card.instanceId === instanceId)
  if (handIndex >= 0) state.hand.splice(handIndex, 1)
  const discardIndex = state.discard.findIndex((card) => card.instanceId === instanceId)
  if (discardIndex >= 0) state.discard.splice(discardIndex, 1)
  state.deck.push(recruited)

  // Sting of the Spider: reaguje na kartę odłożoną na wierzch talii przez
  // Wall-Crawl, ale dopiero wtedy, gdy Sting został wcześniej zagrany w tej turze.
  const stingPlayed = state.cardsPlayedThisTurn.some(
    (card) => card.cardId === 'hero-scarlet-spider-sting-of-the-spider',
  )
  if (stingPlayed) {
    const choice = await ui.chooseOptionWithCard(
      recruited,
      [
        { id: 'draw', label: 'Draw this card' },
        { id: 'leave', label: 'Leave it on top' },
      ],
      'Sting of the Spider: draw the card put on top of your deck?',
    )
    if (choice === 'draw') {
      state.deck.pop()
      state.hand.push(recruited)
    }
  }
}

/** Kupuje S.H.I.E.L.D. Officera ze stosu oficerów. */
export function recruitOfficer(state: GameState): void {
  assertPlaying(state)
  const data = state.cards[state.officerCardId]
  const cost = data.cost ?? 0
  const payWithAttack = heroesCostAttack(state)
  const available = payWithAttack ? state.attack : state.recruit
  if (available < cost) {
    throw new Error(`Za mało ${payWithAttack ? 'attack' : 'recruit'}: masz ${available}, koszt ${cost}`)
  }

  const instance = state.officerDeck.pop()
  if (!instance) throw new Error('Brak dostępnych oficerów')

  if (payWithAttack) state.attack -= cost
  else state.recruit -= cost
  if (state.shardsOnNextRecruitThisTurn) {
    state.shardsOnNextRecruitThisTurn = false
    gainShards(state, cost) // I Am Groot: Officer też jest Bohaterem
  }
  placeRecruitedCard(state, instance)
  logEvent(state, `Recruited: ${data.name}`)
}
