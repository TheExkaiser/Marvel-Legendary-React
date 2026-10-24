import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { getCardAbility } from './cardAbilities'
import { canPlayCard } from './cardRequirements'
import { HAND_SIZE } from './constants'
import { assertPlaying, logEvent } from './common'
import { drawCards } from './deckOps'
import { villainPhase } from './villainPhase'
import { addRecruit, addAttack } from './resources'
import { applyVersatile } from './versatile'
import { getCardData } from './cardData'
import { discardCard } from './keywords'

/** Zagrywa kartę z ręki: dolicza attack/recruit i odpala jej zdolność. */
export async function playCard(
  state: GameState,
  instanceId: string,
  ui: UiAdapter,
): Promise<void> {
  assertPlaying(state)
  const index = state.hand.findIndex((c) => c.instanceId === instanceId)
  if (index === -1) throw new Error(`Karty ${instanceId} nie ma w ręce`)

  const cardId = state.hand[index].cardId
  const data = getCardData(state, state.hand[index])
  if (data.kind === 'wound') throw new Error('Rany nie da się zagrać')
  if (!canPlayCard(state, cardId)) {
    throw new Error('Nie można zagrać tej karty: nie da się zapłacić jej kosztu')
  }

  const [instance] = state.hand.splice(index, 1)
  state.played.push(instance)
  logEvent(state, `Played: ${data.name}`)
  addAttack(state, data.attack ?? 0)
  addRecruit(state, data.recruit ?? 0)

  const override = state.instanceOverrides?.[instance.instanceId]
  const ability = override
    ? (override.abilityId ? getCardAbility(override.abilityId) : undefined)
    : getCardAbility(instance.cardId)
  if (ability) {
    await ability(state, { self: instance, ui })
  }

  // Versatile po zdolności, bo zdolność może go zmienić (Against All Odds)
  if (data.versatile) {
    await applyVersatile(state, ui, data.versatile, instance)
  }

  // Dopiero po zdolności, żeby "zagrano wcześniej w tej turze" nie liczyło samej karty
  state.cardsPlayedThisTurn.push(instance)
}

/** Wkłada do nowej ręki kartę zarezerwowaną przez Electromagnetic Bubble (jeśli jest). */
function addReservedCardToHand(state: GameState): void {
  const instanceId = state.extraCardToHand
  if (!instanceId) return
  state.extraCardToHand = undefined

  const index = state.discard.findIndex((c) => c.instanceId === instanceId)
  if (index === -1) return

  const [card] = state.discard.splice(index, 1)
  state.hand.push(card)
}

type TeleportHook = (state: GameState, ui: UiAdapter, self: CardInstance) => Promise<void>
const teleportHooks = new Map<string, TeleportHook>()

/** Efekt "when you Teleport this card" (Along for the Ride). */
export function registerTeleportHook(cardId: string, fn: TeleportHook): void {
  teleportHooks.set(cardId, fn)
}

/** Czy karta ma Teleport: własne słowo kluczowe albo nadane na tę turę (Azazel). */
export function hasTeleport(state: GameState, instance: CardInstance): boolean {
  return (
    (state.cards[instance.cardId].keywords ?? []).includes('teleport') ||
    (state.teleportGrantedThisTurn ?? []).includes(instance.instanceId)
  )
}

/** Teleport: zamiast zagrać kartę, odkładasz ją na bok. Na koniec tury wróci do ręki jako dodatkowa.
 * force = Teleport z efektu innej karty (karta nie musi mieć słowa kluczowego). */
export async function teleportCard(
  state: GameState,
  instanceId: string,
  ui: UiAdapter,
  force = false,
): Promise<void> {
  assertPlaying(state)
  const index = state.hand.findIndex((c) => c.instanceId === instanceId)
  if (index === -1) throw new Error(`Karty ${instanceId} nie ma w ręce`)

  if (!force && !hasTeleport(state, state.hand[index])) {
    throw new Error('Ta karta nie ma Teleportu')
  }

  const [instance] = state.hand.splice(index, 1)
  state.teleported = [...(state.teleported ?? []), instance]
  logEvent(state, `Teleported: ${state.cards[instance.cardId].name}`)
  await teleportHooks.get(instance.cardId)?.(state, ui, instance)
}

/** Karty z puli Teleport dołączają do nowej ręki (do standardowych kart). */
function addTeleportedCardsToHand(state: GameState): void {
  if (!state.teleported?.length) return
  state.hand.push(...state.teleported)
  state.teleported = []
}

/** Force of Eternity: po dobraniu nowej ręki gracz odrzuca N kart (wybiera które). */
async function discardAfterNewHand(state: GameState, ui: UiAdapter): Promise<void> {
  const count = state.newHandDiscardCount ?? 0
  state.newHandDiscardCount = 0
  for (let i = 0; i < count && state.hand.length > 0; i++) {
    const chosen = await ui.choose(state.hand, {
      prompt: `Force of Eternity: odrzuć kartę (${i + 1}/${count})`,
      optional: false,
    })
    if (!chosen) break
    await discardCard(state, chosen.instanceId, ui)
  }
}

/** Koniec tury: sprzątanie, nowa ręka, a potem faza złoczyńcy (chyba że jest dodatkowa tura). */
export async function endTurn(state: GameState, ui: UiAdapter): Promise<void> {
  assertPlaying(state)

  logEvent(state, `End of turn ${state.turn}`)

  state.discard.push(...state.hand, ...state.played)
  state.hand = []
  state.played = []
  state.cardsPlayedThisTurn = []
  state.attack = 0
  state.recruit = 0
  state.defeatRecruitBonus = 0
  state.koRecruitBonus = 0
  state.recruitsToDeckTop = 0
  state.recruitsToHand = 0
  state.rescueRecruitBonus = 0
  state.rescueAttackBonus = 0
  state.rescueDrawBonus = 0
  state.mindControlThisTurn = false
  state.versatileBothThisTurn = false
  state.locationDefeatBonuses = []
  state.defeatRescueBonus = 0
  state.copiedCardIds = {}
  state.locationAttackModifiers = {}
  state.mastermindAttackModifierThisTurn = 0
  state.recruitCountsAsAttackThisTurn = false
  state.cardsDrawnThisTurn = 0
  state.recruitGainedThisTurn = 0
  state.attackGainedThisTurn = 0
  state.pendingSurgeOfPower = 0
  state.masterStrikeAutoDrawUsedThisTurn = false
  state.teleportGrantedThisTurn = []
  state.focusUsesThisTurn = {}
  state.cancelFightEffectsThisTurn = false
  state.cosmicThreatUsedThisTurn = false
  state.hqRecruitBonuses = {}

  const drawAmount = HAND_SIZE + state.bonusDrawNextTurn
  state.bonusDrawNextTurn = 0

  if (state.extraTurnsQueued > 0) {
    state.extraTurnsQueued -= 1
    drawCards(state, drawAmount)
    addReservedCardToHand(state)
    addTeleportedCardsToHand(state)
    await discardAfterNewHand(state, ui)
  } else {
    state.turn += 1
    drawCards(state, drawAmount)
    addReservedCardToHand(state)
    addTeleportedCardsToHand(state)
    await discardAfterNewHand(state, ui)
    await villainPhase(state, ui)
  }

  // Standardowe dobranie ręki na start tury NIE liczy się jako "extra" karty
  // (Berserker Rage, ewentualne przyszłe karty tego typu) — licznik startuje od zera dopiero teraz.
  state.cardsDrawnThisTurn = 0
}
