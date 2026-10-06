import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { getCardAbility } from './cardAbilities'
import { getVillainAbilities } from './villainAbilities'
import { canDefeatVillain } from './villainRequirements'
import { getEffectiveStrength } from './keywords'
import { getScheme } from './schemeRegistry'
import { assertPlaying } from './common'
import { rescueBystander } from './wounds'
import { addRecruit } from './resources'
import { CITY_NAMES } from './constants'
import { drawCards } from './deckOps'

/** Ile Attack faktycznie masz do dyspozycji w tej turze (uwzględnia God of Thunder: Recruit jako Attack). */
function availableAttack(state: GameState): number {
  return state.attack + (state.recruitCountsAsAttackThisTurn ? state.recruit : 0)
}

/** Płaci koszt w Attack — normalnie wprost z state.attack; z God of Thunder aktywnym
 * i realnym wyborem (oba zasoby > 0) pyta gracza o proporcję. */
async function spendAttack(state: GameState, amount: number, ui: UiAdapter): Promise<void> {
  if (!state.recruitCountsAsAttackThisTurn) {
    state.attack -= amount
    return
  }

  if (state.attack <= 0 || state.recruit <= 0) {
    const fromAttack = Math.min(state.attack, amount)
    state.attack -= fromAttack
    state.recruit -= amount - fromAttack
    return
  }

  const maxFromAttack = Math.min(amount, state.attack)
  const maxFromRecruit = Math.min(amount, state.recruit)
  const { fromAttack, fromRecruit } = await ui.chooseAttackSplit(amount, maxFromAttack, maxFromRecruit)
  state.attack -= fromAttack
  state.recruit -= fromRecruit
}

function removeVillainFromCity(state: GameState, index: number): void {
  const villain = state.city[index]!
  const location = CITY_NAMES[index]
  state.city[index] = null
  addRecruit(state, state.defeatRecruitBonus ?? 0)
  for (let i = 0; i < (state.defeatRescueBonus ?? 0); i++) rescueBystander(state)

  const rescued = state.captives[villain.instanceId] ?? []
  delete state.captives[villain.instanceId]
  delete state.attachedCards[villain.instanceId]

  const scheme = getScheme(state)
  if (scheme.onVillainDefeated) {
    scheme.onVillainDefeated(state, villain)
  } else {
    state.defeated.push(villain)
  }
  state.defeated.push(...rescued)

  // Bonusy za pokonanie Villaina w konkretnych lokacjach (Night Hunter, Nowhere to Hide)
  for (const bonus of state.locationDefeatBonuses ?? []) {
    if (!bonus.locations.includes(location)) continue
    if (bonus.recruit) addRecruit(state, bonus.recruit)
    if (bonus.draw) drawCards(state, bonus.draw)
  }
}

export async function fightVillain(
  state: GameState,
  instanceId: string,
  ui: UiAdapter,
): Promise<void> {
  assertPlaying(state)
  const index = state.city.findIndex((c) => c?.instanceId === instanceId)
  if (index === -1) throw new Error(`Złoczyńcy ${instanceId} nie ma w mieście`)

  const villain = state.city[index]!
  if (!canDefeatVillain(state, villain.cardId)) {
    throw new Error('Nie możesz teraz pokonać tego złoczyńcy (niespełniony warunek)')
  }

  const strength = getEffectiveStrength(state, villain) ?? 0
  if (availableAttack(state) < strength) {
    throw new Error(`Za mało attack: masz ${availableAttack(state)}, siła ${strength}`)
  }

  await spendAttack(state, strength, ui)

  const abilities = getVillainAbilities(villain.cardId)
  if (abilities?.onFight) {
    await abilities.onFight(state, ui, villain)
  }

  removeVillainFromCity(state, index)
}

export function defeatVillainFree(state: GameState, instanceId: string): void {
  const index = state.city.findIndex((c) => c?.instanceId === instanceId)
  if (index === -1) throw new Error(`Złoczyńcy ${instanceId} nie ma w mieście`)

  const villain = state.city[index]!
  if (!canDefeatVillain(state, villain.cardId)) {
    throw new Error('Nie możesz teraz pokonać tego złoczyńcy (niespełniony warunek)')
  }

  removeVillainFromCity(state, index)
}

async function claimTactic(state: GameState, ui: UiAdapter): Promise<void> {
  const tactic = state.tactics.pop()
  if (!tactic) throw new Error('Mastermind jest już pokonany')

  await ui.showInfo(tactic, `Odkryto taktykę: ${state.cards[tactic.cardId].name}`)

  const ability = getCardAbility(tactic.cardId)
  if (ability) {
    await ability(state, { self: tactic, ui })
  }

  state.defeated.push(tactic)
  addRecruit(state, state.defeatRecruitBonus ?? 0)
  for (let i = 0; i < (state.defeatRescueBonus ?? 0); i++) rescueBystander(state)
  if (state.tactics.length === 0) {
    state.status = 'won'
  }
}

export async function fightMastermind(state: GameState, ui: UiAdapter): Promise<void> {
  assertPlaying(state)
  const strength = getEffectiveStrength(state, state.mastermind) ?? 0
  if (availableAttack(state) < strength) {
    throw new Error(`Za mało attack: masz ${availableAttack(state)}, siła ${strength}`)
  }

  await spendAttack(state, strength, ui)
  await claimTactic(state, ui)
}

export async function claimTacticFree(state: GameState, ui: UiAdapter): Promise<void> {
  await claimTactic(state, ui)
}