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
import { asEnemyEffect, getAmbushShields } from './replacements'
import { getMastermindRule } from './mastermindRules'
import { isCityDestroyed } from './cityLayout'
import { passShardsToMastermind } from './shards'
import { runArtifactReactions } from './artifacts'

/** Rozpatruje pojedynczą kartę z talii złoczyńców, według jej rodzaju (bez pop'owania z talii). */
export async function resolveVillainDeckCard(
  state: GameState,
  card: CardInstance,
  ui: UiAdapter,
  prePlayReactionsResolved = false,
): Promise<void> {
  if (!prePlayReactionsResolved) await runArtifactReactions(state, ui, 'before-villain-card')
  const data = state.cards[card.cardId]
  logEvent(state, `Turn ${state.turn}: Drawn from Villain Deck — ${data.name}`)

  // Scheme może rozpatrzyć kartę sam (X-Cutioner's Song: Bohater z talii złoczyńców zostaje jeńcem, nie wchodzi do miasta)
  if (await getScheme(state).onVillainDeckCard?.(state, card, ui)) return

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
export async function playTopVillainCard(state: GameState, ui: UiAdapter): Promise<CardInstance | undefined> {
  if (state.villainDeck.length > 0) await runArtifactReactions(state, ui, 'before-villain-card')
  const card = drawVillainDeckCard(state)
  if (card) await resolveVillainDeckCard(state, card, ui, true)
  return card
}

/** Zdejmuje górne `count` kart talii złoczyńców i pokazuje je graczowi. Pusta talia NIE kończy gry (odkrycie to nie dobranie). Zwraca karty od wierzchu. */
export async function revealTopVillainCards(
  state: GameState,
  ui: UiAdapter,
  count: number,
  title: string,
): Promise<CardInstance[]> {
  const revealed: CardInstance[] = []
  for (let i = 0; i < count; i++) {
    const card = state.villainDeck.pop()
    if (card) revealed.push(card)
  }
  if (revealed.length > 0) await ui.showCards(revealed, title)
  return revealed
}

/** Odkrywa wierzchnią kartę talii złoczyńców i rozpatruje ją według jej rodzaju. */
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

  const stacked =
    state.stackedMasterStrikes?.some((c) => c.instanceId === card.instanceId) ||
    state.tactics.some((c) => c.instanceId === card.instanceId) ||
    state.cityDestroyed?.some((c) => c?.instanceId === card.instanceId) // Galactus: Master Strike leży na zniszczonym polu
  if (!stacked) state.ko.push(card)

  await runArtifactReactions(state, ui, 'master-strike-completed') // Incoming Detector
  await getGameMode(state).onMasterStrikeResolved?.(state, ui)
}

/** Ucieczka złoczyńcy: karta idzie do "escaped", jeńcy tracą (KO), odpalają się efekt scheme'u i zdolność onEscape. */
export async function escapeVillain(state: GameState, villain: CardInstance, ui: UiAdapter): Promise<void> {
  state.escaped.push(villain)
  logEvent(state, `Escaped: ${state.cards[villain.cardId].name}`)

  const lost = state.captives[villain.instanceId] ?? []
  for (const c of lost) {
    if (state.cards[c.cardId].kind === 'bystander') state.escapedBystanders.push(c)
    else state.ko.push(c)
  }
  delete state.captives[villain.instanceId]

  getScheme(state).onVillainEscaped?.(state, villain, lost)

  const escapeAbilities = getVillainAbilities(villain.cardId)
  if (escapeAbilities?.onEscape) {
    await asEnemyEffect(state, () => escapeAbilities.onEscape!(state, ui, villain))
  }

  // Dopiero po efekcie Escape: Korath sprawdza, czy uciekinier "had any Shards"
  passShardsToMastermind(state, villain) // Mastermind dostaje jeden Shard uciekiniera, reszta wraca do zapasu
}

/** Tarcze przed Ambush (Invisible Barrier): true = gracz anulował efekt Ambush. */
async function ambushCancelledByShield(state: GameState, ui: UiAdapter): Promise<boolean> {
  for (const [shieldId, shield] of getAmbushShields()) {
    const holder = state.hand.find((c) => c.cardId === shieldId)
    if (holder && (await shield(state, ui, holder))) return true
  }
  return false
}

/** Wprowadza złoczyńcę (albo pseudo-villaina: Bystandera/Bohatera ze scheme'owej reguły)
 * do miasta (przez Sewers); przesuwa pozostałych, najdalszy może uciec. */
export async function enterCity(state: GameState, villain: CardInstance, ui: UiAdapter): Promise<void> {
  await ui.revealCard(villain, `${state.cards[villain.cardId].name} enters the city`)

  let moving: CardInstance | null = villain

  // Przesuwanie w stronę wyjścia: każda karta wypycha poprzednią
  for (let i = state.city.length - 1; i >= 0 && moving; i--) {
    if (isCityDestroyed(state, i)) continue // zniszczone pole nie istnieje: Villainowie je omijają
    const occupant: CardInstance | null = state.city[i]
    state.city[i] = moving
    moving = occupant
  }

  // Ucieczka: najdalszy złoczyńca opuszcza miasto
  if (moving) await escapeVillain(state, moving, ui)

  // Wejście nowego złoczyńcy: hook scheme'u + Ambush
  getScheme(state).onVillainEntered?.(state, villain)

  const ambushAbilities = getVillainAbilities(villain.cardId)
  if (ambushAbilities?.onAmbush) {
    if (await ambushCancelledByShield(state, ui)) return
    await asEnemyEffect(state, () => ambushAbilities.onAmbush!(state, ui, villain))
    await runArtifactReactions(state, ui, 'ambush-completed') // Incoming Detector
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
  await getScheme(state).onTwist?.(state, state.twistsRevealed, ui, twist)
  await getGameMode(state).onSchemeTwistResolved?.(state, ui)
  if (!getScheme(state).keepsTwistCard) state.ko.push(twist) // TODO: karta ma leżeć obok scheme'u (schemeTwists), nie w KO
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
