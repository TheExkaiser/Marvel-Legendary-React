import type { GameState } from './types'
import type { UiAdapter } from './ui'
import { getCardAbility } from './cardAbilities'
import { getVillainAbilities } from './villainAbilities'
import { canDefeatVillain } from './villainRequirements'
import { assertPlaying } from './common'

/** Zdejmuje złoczyńcę z miasta do stosu pokonanych razem z uratowanymi jeńcami. */
function removeVillainFromCity(state: GameState, index: number): void {
  const villain = state.city[index]!
  state.defeated.push(villain)
  state.city[index] = null
  state.recruit += state.defeatRecruitBonus ?? 0

  const rescued = state.captives[villain.instanceId] ?? []
  state.defeated.push(...rescued)
  delete state.captives[villain.instanceId]
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

  const strength = state.cards[villain.cardId].strength ?? 0
  if (state.attack < strength) {
    throw new Error(`Za mało attack: masz ${state.attack}, siła ${strength}`)
  }

  state.attack -= strength

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
  state.recruit += state.defeatRecruitBonus ?? 0
  if (state.tactics.length === 0) {
    state.status = 'won'
  }
}

/** Walka z mastermindem: płaci attack i zabiera taktykę. */
export async function fightMastermind(state: GameState, ui: UiAdapter): Promise<void> {
  assertPlaying(state)
  const strength = state.cards[state.mastermind.cardId].strength ?? 0
  if (state.attack < strength) {
    throw new Error(`Za mało attack: masz ${state.attack}, siła ${strength}`)
  }

  state.attack -= strength
  await claimTactic(state, ui)
}

/** Zabranie taktyki bez płacenia attack (np. Silent Sniper). */
export async function claimTacticFree(state: GameState, ui: UiAdapter): Promise<void> {
  await claimTactic(state, ui)
}