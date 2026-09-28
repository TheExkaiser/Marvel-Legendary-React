import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { getCardAbility } from './cardAbilities'
import { getVillainAbilities } from './villainAbilities'
import { canDefeatVillain } from './villainRequirements'
import { getEffectiveStrength } from './keywords'
import { assertPlaying } from './common'
import { rescueBystander } from './wounds' // <- podmień na właściwy plik, jeśli to nie ten
import { addRecruit } from './resources'

/** Ile Attack faktycznie masz do dyspozycji w tej turze (uwzględnia God of Thunder: Recruit jako Attack). */
function availableAttack(state: GameState): number {
  return state.attack + (state.recruitCountsAsAttackThisTurn ? state.recruit : 0)
}

/** Płaci koszt w Attack: najpierw z state.attack, resztę z state.recruit (jeśli dozwolone). */
function spendAttack(state: GameState, amount: number): void {
  const fromAttack = Math.min(state.attack, amount)
  state.attack -= fromAttack
  const remaining = amount - fromAttack
  if (remaining > 0) state.recruit -= remaining
}

/** Zdejmuje złoczyńcę z miasta do stosu pokonanych razem z uratowanymi jeńcami. */
function removeVillainFromCity(state: GameState, index: number): void {
  const villain = state.city[index]!
  state.defeated.push(villain)
  state.city[index] = null
  addRecruit(state, state.defeatRecruitBonus ?? 0)
  for (let i = 0; i < (state.defeatRescueBonus ?? 0); i++) rescueBystander(state)

  const rescued = state.captives[villain.instanceId] ?? []
  state.defeated.push(...rescued)
  delete state.captives[villain.instanceId]
  delete state.attachedCards[villain.instanceId]
}

/** Walka ze złoczyńcą: sprawdza warunek i siłę, odpala Fight, zdejmuje z miasta. */
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

  spendAttack(state, strength)

  const abilities = getVillainAbilities(villain.cardId)
  if (abilities?.onFight) {
    await abilities.onFight(state, ui, villain)
  }

  removeVillainFromCity(state, index)
}

/** Darmowe pokonanie (np. Silent Sniper): respektuje warunek pokonania, ale NIE odpala "Fight". */
export function defeatVillainFree(state: GameState, instanceId: string): void {
  const index = state.city.findIndex((c) => c?.instanceId === instanceId)
  if (index === -1) throw new Error(`Złoczyńcy ${instanceId} nie ma w mieście`)

  const villain = state.city[index]!
  if (!canDefeatVillain(state, villain.cardId)) {
    throw new Error('Nie możesz teraz pokonać tego złoczyńcy (niespełniony warunek)')
  }

  removeVillainFromCity(state, index)
}

/** Zabiera wierzchnią taktykę mastermina: popup, efekt Fight, do Victory Pool. Ostatnia = wygrana. */
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

/** Walka z mastermindem: płaci attack i zabiera taktykę. */
export async function fightMastermind(state: GameState, ui: UiAdapter): Promise<void> {
  assertPlaying(state)
  const strength = getEffectiveStrength(state, state.mastermind) ?? 0
  if (availableAttack(state) < strength) {
    throw new Error(`Za mało attack: masz ${availableAttack(state)}, siła ${strength}`)
  }

  spendAttack(state, strength)
  await claimTactic(state, ui)
}

/** Zabranie taktyki bez płacenia attack (np. Silent Sniper). */
export async function claimTacticFree(state: GameState, ui: UiAdapter): Promise<void> {
  await claimTactic(state, ui)
}