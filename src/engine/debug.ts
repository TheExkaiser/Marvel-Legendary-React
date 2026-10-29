import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { koFromHq, refillHq } from './recruit'
import { drawCards } from './deckOps'
import { escapeVillain, playNextVillainDeckCardOfKind, playTopVillainCard } from './villainPhase'
import { isCityDestroyed } from './cityLayout'

/** Id kart startowych — patrz data/sets/01_Core_Set/cards.ts (STARTING_CARDS). */
const STARTING_CARD_IDS = ['shield-agent', 'shield-trooper']

/** DEBUG: bohaterowie z HQ wracają na spód talii bohaterów (index 0 = spód), HQ dobiera nowych. */
export function debugReplaceAllHeroesInHq(state: GameState): void {
  for (let i = 0; i < state.hq.length; i++) {
    const instance = state.hq[i]
    if (instance) {
      state.heroDeck.unshift(instance)
      state.hq[i] = null
    }
  }
  refillHq(state)
}

/** DEBUG: wszystkie karty startowe (agent/trooper) z ręki, zagranych, discardu i talii trafiają do KO. */
export function debugRemoveAllStartingCards(state: GameState): void {
  const piles: CardInstance[][] = [state.hand, state.played, state.discard, state.deck]
  for (const pile of piles) {
    for (let i = pile.length - 1; i >= 0; i--) {
      if (STARTING_CARD_IDS.includes(pile[i].cardId)) {
        state.ko.push(...pile.splice(i, 1))
      }
    }
  }
}

export async function debugDrawVillainCard(state: GameState, ui: UiAdapter): Promise<void> {
  await playTopVillainCard(state, ui)
}

export async function debugPlayNextMasterStrike(state: GameState, ui: UiAdapter): Promise<void> {
  await playNextVillainDeckCardOfKind(state, ui, 'masterstrike')
}

export async function debugPlayNextSchemeTwist(state: GameState, ui: UiAdapter): Promise<void> {
  await playNextVillainDeckCardOfKind(state, ui, 'twist')
}

export function debugKoAllHeroesFromHq(state: GameState): void {
  for (let i = 0; i < state.hq.length; i++) {
    const hero = state.hq[i]
    if (hero && state.cards[hero.cardId].hero) koFromHq(state, i)
  }
  refillHq(state)
}

export async function debugEscapeAllVillainsFromCity(state: GameState, ui: UiAdapter): Promise<void> {
  for (let i = 0; i < state.city.length; i++) {
    const villain = state.city[i]
    if (!villain) continue
    state.city[i] = null
    await escapeVillain(state, villain, ui)
  }
}

/** DEBUG: advance every villain one city space toward the Bridge; a Bridge villain escapes. */
export async function debugMoveAllVillainsToLeft(state: GameState, ui: UiAdapter): Promise<void> {
  const spaces = state.city.map((_, index) => index).filter((index) => !isCityDestroyed(state, index))
  const villains = spaces.map((index) => state.city[index])
  let escaping: CardInstance | undefined
  state.city = state.city.map(() => null)

  villains.forEach((villain, position) => {
    if (!villain) return
    const destination = position - 1
    if (destination < 0) {
      escaping = villain
      return
    }
    state.city[spaces[destination]] = villain
  })

  if (escaping) await escapeVillain(state, escaping, ui)
}

export function debugDrawCard(state: GameState): void {
  drawCards(state, 1)
}