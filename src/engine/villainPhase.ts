import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { getScheme } from './schemeRegistry'
import { getGameMode } from './gameModeRegistry'
import { getCardAbility } from './cardAbilities'
import { getVillainAbilities } from './villainAbilities'
import { ESCAPE_LIMIT } from './constants'
import { logEvent } from './common'
import { captureBystander } from './wounds'
import { runMasterStrikeReactions } from './masterStrikeReactions'
import { asEnemyEffect } from './replacements'
import { getMastermindRule } from './mastermindRules'

/** Rozpatruje pojedynczą kartę z talii złoczyńców, według jej rodzaju (bez pop'owania z talii). */
export async function resolveVillainDeckCard(
  state: GameState,
  card: CardInstance,
  ui: UiAdapter,
): Promise<void> {
  console.log('resolveVillainDeckCard:', state.cards[card.cardId].name, new Error().stack?.split('\n').slice(2, 6).join(' | '))
  
  const data = state.cards[card.cardId]
  logEvent(state, `Tura ${state.turn}: odkryto ${data.name}`)

  if (data.kind === 'bystander' && !getScheme(state).treatBystandersAsVillains) {
    await captureBystander(state, card, ui)
  } else if (data.kind === 'twist') {
    await resolveTwist(state, card, ui)
  } else if (data.kind === 'masterstrike') {
    await resolveMasterStrike(state, card, ui)
  } else {
    await enterCity(state, card, ui)
  }
}

/** Zdejmuje wierzchnią kartę talii złoczyńców. Pusta talia = przegrana (jedyne miejsce w silniku, które to robi). */
export function drawVillainDeckCard(state: GameState): CardInstance | undefined {
  const card = state.villainDeck.pop()
  if (!card) state.status = 'lost'
  return card
}

/** "Play another card from the Villain Deck": zdejmij i rozpatrz wierzchnią kartę. */
export async function playTopVillainCard(state: GameState, ui: UiAdapter): Promise<void> {
  const card = drawVillainDeckCard(state)
  if (card) await resolveVillainDeckCard(state, card, ui)
}

export async function villainPhase(state: GameState, ui: UiAdapter): Promise<void> {
  await playTopVillainCard(state, ui)
  checkEndConditions(state)
}

/** Master Strike: popup, efekt mastermina, karta idzie do KO, ewentualny hook Game Mode. */
export async function resolveMasterStrike(
  state: GameState,
  card: CardInstance,
  ui: UiAdapter,
): Promise<void> {
  await ui.revealCard(card, 'Odkryto: Master Strike!')

  await runMasterStrikeReactions(state, ui)

  const ability = getCardAbility(state.masterStrikeId)
  if (ability) {
    await asEnemyEffect(state, () => ability(state, { self: card, ui }))
  }

  const stacked = state.stackedMasterStrikes?.some((c) => c.instanceId === card.instanceId)
  if (!stacked) state.ko.push(card)

  await getGameMode(state).onMasterStrikeResolved?.(state, ui)
}

/** Wprowadza złoczyńcę (albo pseudo-villaina: Bystandera/Bohatera ze scheme'owej reguły)
 * do miasta (przez Sewers); przesuwa pozostałych, najdalszy może uciec. */
export async function enterCity(state: GameState, villain: CardInstance, ui: UiAdapter): Promise<void> {
  await ui.revealCard(villain, `${state.cards[villain.cardId].name} enters the city`)

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

    getScheme(state).onVillainEscaped?.(state, moving, lost)

    const escapeAbilities = getVillainAbilities(moving.cardId)
    const escapee = moving
    if (escapeAbilities?.onEscape) {
      await asEnemyEffect(state, () => escapeAbilities.onEscape!(state, ui, escapee))
    }
  }

  // Wejście nowego złoczyńcy: hook scheme'u + Ambush
  getScheme(state).onVillainEntered?.(state, villain)

  const ambushAbilities = getVillainAbilities(villain.cardId)
  if (ambushAbilities?.onAmbush) {
    await asEnemyEffect(state, () => ambushAbilities.onAmbush!(state, ui, villain))
  }
}

/** Scheme Twist: licznik, popup, efekt scheme'u, ewentualny hook Game Mode. */
async function resolveTwist(
  state: GameState,
  twist: CardInstance,
  ui: UiAdapter,
): Promise<void> {
  state.twistsRevealed += 1
  logEvent(state, `Scheme Twist #${state.twistsRevealed}`)
  await ui.revealCard(twist, `Odkryto: Scheme Twist #${state.twistsRevealed}`)
  await getScheme(state).onTwist?.(state, state.twistsRevealed, ui)
  await getGameMode(state).onSchemeTwistResolved?.(state, ui)
  state.ko.push(twist) // TODO: karta ma leżeć obok scheme'u (schemeTwists), nie w KO
}

/** Sprawdza przegraną: limit uciekinierów (TYLKO jeśli scheme go definiuje) albo warunek scheme'u. */
export function checkEndConditions(state: GameState): void {
  if (state.status !== 'playing') return

  const scheme = getScheme(state)
  const escapedTooMany = scheme.escapeLimit !== undefined && state.escaped.length >= scheme.escapeLimit

  if (escapedTooMany || scheme.checkLoss?.(state) || getMastermindRule(state)?.checkLoss?.(state)) {
    state.status = 'lost'
  }
}
