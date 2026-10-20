import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { getWoundReplacement } from './replacements'
import { addRecruit, addAttack } from './resources'
import { drawCards } from './deckOps'
import { getMastermindRule } from './mastermindRules'
import { getCardAbility } from './cardAbilities'

/** Gracz zyskuje ranę, chyba że zamiennik (np. Diving Block) ją zastąpi. */
export async function gainWound(state: GameState, ui: UiAdapter): Promise<void> {
  for (const card of [...state.hand, ...state.played]) {
    const replacement = getWoundReplacement(card.cardId)
    if (replacement) {
      const replaced = await replacement(state, ui, card)
      if (replaced) return
    }
  }
  gainWoundSilent(state)
}

/** Rana do stosu odrzuconych z pominięciem zamienników. */
export function gainWoundSilent(state: GameState): void {
  const wound = state.wounds.pop()
  if (!wound) return
  if (getMastermindRule(state)?.woundsToDeckTop) state.deck.push(wound) // koniec tablicy = wierzch talii
  else state.discard.push(wound)
}

/** Bonusy "whenever you rescue a Bystander this turn" (Jean Grey). */
export function applyRescueBonuses(state: GameState, count: number): void {
  if (count <= 0) return
  if (state.rescueRecruitBonus) addRecruit(state, state.rescueRecruitBonus * count)
  if (state.rescueAttackBonus) addAttack(state, state.rescueAttackBonus * count)
  if (state.rescueDrawBonus) drawCards(state, state.rescueDrawBonus * count)
}

/** Uratowana konkretna karta (Bystander z wierzchu talii złoczyńców, jeniec itp.) idzie do Victory Pool.
 * Popup z kartą, bonusy "whenever you rescue" i (tylko dla Bystandera) zdolność "When you rescue this Bystander". */
export async function rescueCard(state: GameState, card: CardInstance, ui: UiAdapter): Promise<void> {
  const data = state.cards[card.cardId]
  await ui.showRescue(card, `Rescued: ${data.name}`)
  state.defeated.push(card)
  applyRescueBonuses(state, 1)
  // Jeńcem bywa też Bohater (X-Cutioner's Song): jego zdolność zagrania nie może się tu odpalić
  if (data.kind !== 'bystander') return
  const ability = getCardAbility(card.cardId)
  if (ability) await ability(state, { self: card, ui })
}

/** Uratowany bystander ze stosu idzie do Victory Pool (tak samo jak rescueCard). */
export async function rescueBystander(state: GameState, ui: UiAdapter): Promise<void> {
  const bystander = state.bystanders.pop()
  if (bystander) await rescueCard(state, bystander, ui)
}

/** Odkryty bystander zostaje jeńcem najdalszego złoczyńcy; przy pustym mieście jeńcem zostaje mastermind. */
export async function captureBystander(
  state: GameState,
  bystander: CardInstance,
  ui: UiAdapter,
): Promise<void> {
  for (let i = state.city.length - 1; i >= 0; i--) {
    const villain = state.city[i]
    if (villain) {
      const list = state.captives[villain.instanceId] ?? []
      list.push(bystander)
      state.captives[villain.instanceId] = list
      await ui.showCapture(
        villain,
        bystander,
        `Bystander captured by ${state.cards[villain.cardId].name}`,
      )
      return
    }
  }

  const list = state.captives[state.mastermind.instanceId] ?? []
  list.push(bystander)
  state.captives[state.mastermind.instanceId] = list
  await ui.showCapture(
    state.mastermind,
    bystander,
    `Bystander captured by ${state.cards[state.mastermind.cardId].name}`,
  )
}
