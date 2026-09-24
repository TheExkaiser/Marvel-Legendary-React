import type { GameState } from './types'
import type { UiAdapter } from './ui'
import { getCardAbility } from './cardAbilities'
import { canPlayCard } from './cardRequirements'
import { HAND_SIZE } from './constants'
import { assertPlaying } from './common'
import { drawCards } from './deckOps'
import { villainPhase } from './villainPhase'

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
  state.attack += data.attack ?? 0
  state.recruit += data.recruit ?? 0

  const ability = getCardAbility(instance.cardId)
  if (ability) {
    await ability(state, { self: instance, ui })
  }

  // Dopiero po zdolności, żeby "zagrano wcześniej w tej turze" nie liczyło samej karty
  state.cardsPlayedThisTurn.push(instance)
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

  const drawAmount = HAND_SIZE + state.bonusDrawNextTurn
  state.bonusDrawNextTurn = 0

  if (state.extraTurnsQueued > 0) {
    state.extraTurnsQueued -= 1
    drawCards(state, drawAmount)
  } else {
    state.turn += 1
    drawCards(state, drawAmount)
    await villainPhase(state, ui)
  }
}
