import type { GameState } from './types'
import type { UiAdapter } from './ui'
import { getCardAbility } from './cardAbilities'
import { canPlayCard } from './cardRequirements'
import { HAND_SIZE } from './constants'
import { assertPlaying } from './common'
import { drawCards } from './deckOps'
import { villainPhase } from './villainPhase'
import { addRecruit, addAttack } from './resources'

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
  const data = state.cards[cardId]
  if (data.kind === 'wound') throw new Error('Rany nie da się zagrać')
  if (!canPlayCard(state, cardId)) {
    throw new Error('Nie można zagrać tej karty: nie da się zapłacić jej kosztu')
  }

  const [instance] = state.hand.splice(index, 1)
  state.played.push(instance)
  addAttack(state, data.attack ?? 0)
  addRecruit(state, data.recruit ?? 0)

  const ability = getCardAbility(instance.cardId)
  if (ability) {
    await ability(state, { self: instance, ui })
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

/** Teleport: zamiast zagrać kartę, odkładasz ją na bok. Na koniec tury wróci do ręki jako dodatkowa. */
export function teleportCard(state: GameState, instanceId: string): void {
  assertPlaying(state)
  const index = state.hand.findIndex((c) => c.instanceId === instanceId)
  if (index === -1) throw new Error(`Karty ${instanceId} nie ma w ręce`)

  const data = state.cards[state.hand[index].cardId]
  if (!(data.keywords ?? []).includes('teleport')) {
    throw new Error('Ta karta nie ma Teleportu')
  }

  const [instance] = state.hand.splice(index, 1)
  state.teleported = [...(state.teleported ?? []), instance]
}

/** Karty z puli Teleport dołączają do nowej ręki (do standardowych kart). */
function addTeleportedCardsToHand(state: GameState): void {
  if (!state.teleported?.length) return
  state.hand.push(...state.teleported)
  state.teleported = []
}

/** Koniec tury: sprzątanie, nowa ręka, a potem faza złoczyńcy (chyba że jest dodatkowa tura). */
export async function endTurn(state: GameState, ui: UiAdapter): Promise<void> {
  assertPlaying(state)

  state.discard.push(...state.hand, ...state.played)
  state.hand = []
  state.played = []
  state.cardsPlayedThisTurn = []
  state.attack = 0
  state.recruit = 0
  state.defeatRecruitBonus = 0
  state.koRecruitBonus = 0
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

  const drawAmount = HAND_SIZE + state.bonusDrawNextTurn
  state.bonusDrawNextTurn = 0

  if (state.extraTurnsQueued > 0) {
    state.extraTurnsQueued -= 1
    drawCards(state, drawAmount)
    addReservedCardToHand(state)
    addTeleportedCardsToHand(state)
  } else {
    state.turn += 1
    drawCards(state, drawAmount)
    addReservedCardToHand(state)
    addTeleportedCardsToHand(state)
    await villainPhase(state, ui)
  }

  // Standardowe dobranie ręki na start tury NIE liczy się jako "extra" karty
  // (Berserker Rage, ewentualne przyszłe karty tego typu) — licznik startuje od zera dopiero teraz.
  state.cardsDrawnThisTurn = 0
}
