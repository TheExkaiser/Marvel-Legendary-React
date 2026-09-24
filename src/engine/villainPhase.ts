import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { getScheme } from './schemeRegistry'
import { getCardAbility } from './cardAbilities'
import { getVillainAbilities } from './villainAbilities'
import { ESCAPE_LIMIT } from './constants'
import { logEvent } from './common'
import { captureBystander } from './wounds'

/** Odkrywa wierzchnią kartę talii złoczyńców i rozpatruje ją według jej rodzaju. */
export async function villainPhase(state: GameState, ui: UiAdapter): Promise<void> {
  const card = state.villainDeck.pop()
  if (!card) return

  const data = state.cards[card.cardId]
  logEvent(state, `Tura ${state.turn}: odkryto ${data.name}`)

  if (data.kind === 'bystander') {
    captureBystander(state, card)
  } else if (data.kind === 'twist') {
    await resolveTwist(state, card, ui)
  } else if (data.kind === 'masterstrike') {
    await resolveMasterStrike(state, card, ui)
  } else {
    await enterCity(state, card, ui)
  }

  checkEndConditions(state)
}

/** Master Strike: popup, efekt mastermina, karta idzie do KO. */
async function resolveMasterStrike(
  state: GameState,
  card: CardInstance,
  ui: UiAdapter,
): Promise<void> {
  await ui.showInfo(card, 'Odkryto: Master Strike!')

  const ability = getCardAbility(state.masterStrikeId)
  if (ability) {
    await ability(state, { self: card, ui })
  }

  state.ko.push(card)
}

/** Wprowadza złoczyńcę do miasta (przesuwa pozostałych); najdalszy może uciec. */
async function enterCity(state: GameState, villain: CardInstance, ui: UiAdapter): Promise<void> {
  let moving: CardInstance | null = villain

  // Przesuwanie w stronę wyjścia: każda karta wypycha poprzednią
  for (let i = state.city.length - 1; i >= 0 && moving; i--) {
    const occupant: CardInstance | null = state.city[i]
    state.city[i] = moving
    moving = occupant
  }

  // Ucieczka: karta zostaje w "escaped", jeńcy tracą (KO), odpalają się efekty
  if (moving) {
    state.escaped.push(moving)
    logEvent(state, `Ucieka: ${state.cards[moving.cardId].name}`)

    const lost = state.captives[moving.instanceId] ?? []
    state.ko.push(...lost)
    delete state.captives[moving.instanceId]

    getScheme(state).onVillainEscaped?.(state, moving)

    const escapeAbilities = getVillainAbilities(moving.cardId)
    if (escapeAbilities?.onEscape) {
      await escapeAbilities.onEscape(state, ui, moving)
    }
  }

  // Wejście nowego złoczyńcy: hook scheme'u + Ambush
  getScheme(state).onVillainEntered?.(state, villain)

  const ambushAbilities = getVillainAbilities(villain.cardId)
  if (ambushAbilities?.onAmbush) {
    await ambushAbilities.onAmbush(state, ui, villain)
  }
}

/** Scheme Twist: licznik, popup, efekt scheme'u. */
async function resolveTwist(
  state: GameState,
  twist: CardInstance,
  ui: UiAdapter,
): Promise<void> {
  state.twistsRevealed += 1
  logEvent(state, `Scheme Twist #${state.twistsRevealed}`)
  await ui.showInfo(twist, `Odkryto: Scheme Twist #${state.twistsRevealed}`)
  await getScheme(state).onTwist?.(state, state.twistsRevealed, ui)
  state.ko.push(twist) // TODO: karta ma leżeć obok scheme'u (schemeTwists), nie w KO
}

/** Sprawdza przegraną: limit uciekinierów albo warunek scheme'u. */
function checkEndConditions(state: GameState): void {
  if (state.status !== 'playing') return

  const scheme = getScheme(state)
  const limit = scheme.escapeLimit ?? ESCAPE_LIMIT

  if (state.escaped.length >= limit || scheme.checkLoss?.(state)) {
    state.status = 'lost'
  }
}
