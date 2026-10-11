import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { getCardAbility } from './cardAbilities'
import { getVillainAbilities } from './villainAbilities'
import { canDefeatVillain } from './villainRequirements'
import { getEffectiveStrength } from './keywords'
import { getScheme } from './schemeRegistry'
import { assertPlaying } from './common'
import { rescueBystander, applyRescueBonuses } from './wounds'
import { addRecruit } from './resources'
import { CITY_NAMES } from './constants'
import { drawCards } from './deckOps'
import { asEnemyEffect } from './replacements'
import { gainVillainAsHero } from './cardData'

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
  applyRescueBonuses(state, rescued.length) // jeńcy uratowani przez pokonanie Villaina też liczą się jako "rescue"

  // Bonusy za pokonanie Villaina w konkretnych lokacjach (Night Hunter, Nowhere to Hide)
  for (const bonus of state.locationDefeatBonuses ?? []) {
    if (!bonus.locations.includes(location)) continue
    if (bonus.recruit) addRecruit(state, bonus.recruit)
    if (bonus.draw) drawCards(state, bonus.draw)
  }
}

/** Mind Control (Professor X): zdobywasz pokonanego Villaina. Idzie do Twoich odrzuconych jak kupiona karta
 * i działa jak Bohater z Attack równym swojej sile. Działa przy każdym pokonaniu (walka, za darmo, z talii). */
async function offerMindControl(state: GameState, villain: CardInstance, ui: UiAdapter): Promise<void> {
  if (!state.mindControlThisTurn) return

  // Jeśli scheme przejął kartę (onVillainDefeated), nie ma jej w Victory Pile i nie ma czego zdobywać
  const pileIndex = state.defeated.findIndex((c) => c.instanceId === villain.instanceId)
  if (pileIndex === -1) return

  const data = state.cards[villain.cardId]
  const chosen = await ui.choose([villain], {
    prompt: `Mind Control: zdobyć ${data.name} jako Bohatera (+${data.strength ?? 0} Attack)?`,
    optional: true,
  })
  if (!chosen) return

  state.defeated.splice(pileIndex, 1)
  state.discard.push(villain)
  gainVillainAsHero(state, villain)
}

/** Villain z wierzchu talii złoczyńców (Telepathic Probe, Hail of Bullets): zdejmuje go i pokonuje.
 * payAttack = true: płaci Attack (zwraca false, gdy za mało); false: pokonanie za darmo. */
export async function defeatVillainFromDeck(
  state: GameState,
  ui: UiAdapter,
  payAttack: boolean,
): Promise<boolean> {
  assertPlaying(state)
  const villain = state.villainDeck[state.villainDeck.length - 1]
  if (!villain) return false
  if (!canDefeatVillain(state, villain.cardId)) return false

  if (payAttack) {
    const strength = getEffectiveStrength(state, villain) ?? 0
    if (availableAttack(state) < strength) return false
    await spendAttack(state, strength, ui)
  }

  state.villainDeck.pop()

  const abilities = getVillainAbilities(villain.cardId)
  if (abilities?.onFight) {
    await asEnemyEffect(state, () => abilities.onFight!(state, ui, villain))
  }

  addRecruit(state, state.defeatRecruitBonus ?? 0)
  for (let i = 0; i < (state.defeatRescueBonus ?? 0); i++) rescueBystander(state)

  const scheme = getScheme(state)
  if (scheme.onVillainDefeated) {
    scheme.onVillainDefeated(state, villain)
  } else {
    state.defeated.push(villain)
  }

  await offerMindControl(state, villain, ui)
  return true
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
    await asEnemyEffect(state, () => abilities.onFight!(state, ui, villain))
  }

  removeVillainFromCity(state, index)
  await offerMindControl(state, villain, ui)
}

export async function defeatVillainFree(state: GameState, instanceId: string, ui: UiAdapter): Promise<void> {
  const index = state.city.findIndex((c) => c?.instanceId === instanceId)
  if (index === -1) throw new Error(`Złoczyńcy ${instanceId} nie ma w mieście`)

  const villain = state.city[index]!
  if (!canDefeatVillain(state, villain.cardId)) {
    throw new Error('Nie możesz teraz pokonać tego złoczyńcy (niespełniony warunek)')
  }

  removeVillainFromCity(state, index)
  await offerMindControl(state, villain, ui)
}

async function claimTactic(state: GameState, ui: UiAdapter): Promise<void> {
  const tactic = state.tactics.pop()
  if (!tactic) throw new Error('Mastermind jest już pokonany')

  await ui.showInfo(tactic, `Odkryto taktykę: ${state.cards[tactic.cardId].name}`)

  const ability = getCardAbility(tactic.cardId)
  if (ability) {
    await asEnemyEffect(state, () => ability(state, { self: tactic, ui }))
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
