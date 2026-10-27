import type { CardInstance, GameState } from './types'
import type { UiAdapter } from './ui'
import { assertPlaying, logEvent } from './common'
import { addAttack, addRecruit } from './resources'

/** Liczba żetonów Shard w grze (Guardians of the Galaxy). */
export const SHARD_SUPPLY_SIZE = 18

/** Czy w grze są karty operujące na Shardach (słowo kluczowe 'shard' w danych karty). Steruje widocznością licznika w UI. */
export function gameUsesShards(state: GameState): boolean {
  return Object.values(state.cards).some((card) => (card.keywords ?? []).includes('shard'))
}

export function shardSupply(state: GameState): number {
  return state.shardSupply ?? SHARD_SUPPLY_SIZE
}

export function shardsOn(state: GameState, target: { instanceId: string }): number {
  return state.shardsOn?.[target.instanceId] ?? 0
}

/** Attack od Shardów leżących na złoczyńcy lub masterminedzie (+1 za każdy), chyba że efekt wyłączył go na tę turę. */
export function shardAttackBonus(state: GameState, target: { instanceId: string }): number {
  if (state.shardAttackSuppressedThisTurn?.includes(target.instanceId)) return 0
  return shardsOn(state, target)
}

/** Zdejmuje z zapasu do `count` Shardów. Pusty zapas = Shard nie jest zdobyty, gra toczy się dalej. */
function takeFromSupply(state: GameState, count: number): number {
  const taken = Math.max(0, Math.min(count, shardSupply(state)))
  state.shardSupply = shardSupply(state) - taken
  return taken
}

function returnToSupply(state: GameState, count: number): void {
  if (count > 0) state.shardSupply = shardSupply(state) + count
}

function setShardsOn(state: GameState, target: { instanceId: string }, count: number): void {
  const next = { ...state.shardsOn }
  if (count > 0) next[target.instanceId] = count
  else delete next[target.instanceId]
  state.shardsOn = next
}

/** Gracz zdobywa Shardy z zapasu. Zwraca, ile faktycznie zdobył. */
export function gainShards(state: GameState, count: number): number {
  const taken = takeFromSupply(state, count)
  if (taken > 0) {
    state.shards = (state.shards ?? 0) + taken
    logEvent(state, `Gained ${taken} Shard${taken === 1 ? '' : 's'}`)
  }
  return taken
}

/** Złoczyńca lub Mastermind zdobywa Shardy z zapasu (kładą się na jego karcie). Zwraca, ile faktycznie zdobył. */
export function placeShardsOn(state: GameState, target: CardInstance, count: number): number {
  const taken = takeFromSupply(state, count)
  if (taken > 0) {
    setShardsOn(state, target, shardsOn(state, target) + taken)
    logEvent(state, `${state.cards[target.cardId].name} gains ${taken} Shard${taken === 1 ? '' : 's'}`)
  }
  return taken
}

/** Po pokonaniu Villaina / walce z Mastermindem: bierzesz jeden Shard z jego karty, resztę zwracasz do zapasu. */
export function claimShardFrom(state: GameState, target: CardInstance): void {
  const count = shardsOn(state, target)
  if (count === 0) return
  setShardsOn(state, target, 0)
  state.shards = (state.shards ?? 0) + 1
  returnToSupply(state, count - 1)
  logEvent(state, `Took a Shard from ${state.cards[target.cardId].name}`)
}

/** Ucieczka Villaina: Mastermind dostaje jeden z jego Shardów, resztę zwracasz do zapasu. */
export function passShardsToMastermind(state: GameState, villain: CardInstance): void {
  const count = shardsOn(state, villain)
  if (count === 0) return
  setShardsOn(state, villain, 0)
  setShardsOn(state, state.mastermind, shardsOn(state, state.mastermind) + 1)
  returnToSupply(state, count - 1)
}

/** Wydaje `count` Shardów gracza: wracają do zapasu, każdy daje +1 Attack (albo +1 Recruit, gdy pozwala na to efekt tury). */
export function spendShards(state: GameState, count: number, resource: 'attack' | 'recruit' = 'attack'): void {
  assertPlaying(state)
  const have = state.shards ?? 0
  if (!Number.isInteger(count) || count < 1 || count > have) {
    throw new Error(`Nie możesz wydać ${count} Shardów: masz ${have}`)
  }
  if (resource === 'recruit' && !state.shardsAsRecruitThisTurn) {
    throw new Error('W tej turze nie możesz wydawać Shardów na Recruit')
  }
  state.shards = have - count
  returnToSupply(state, count)
  if (resource === 'recruit') addRecruit(state, count)
  else addAttack(state, count)
  logEvent(state, `Spent ${count} Shard${count === 1 ? '' : 's'}: +${count} ${resource === 'recruit' ? 'Recruit' : 'Attack'}`)
}

/** Wydaje `shardCount` Shardów za stałą premię Attack (Godslayer Blade: 5 Shardów = +10 Attack). */
export function spendShardsForAttack(state: GameState, shardCount: number, attack: number): void {
  assertPlaying(state)
  const have = state.shards ?? 0
  if (shardCount > have) throw new Error(`Za mało Shardów: masz ${have}, potrzeba ${shardCount}`)
  state.shards = have - shardCount
  returnToSupply(state, shardCount)
  addAttack(state, attack)
  logEvent(state, `Spent ${shardCount} Shards: +${attack} Attack`)
}

/** Kliknięcie licznika Shardów: gracz wybiera zasób (tylko gdy efekt tury pozwala na Recruit) i ile Shardów wydać (0 = nic). */
export async function spendShardsWithPrompt(state: GameState, ui: UiAdapter): Promise<void> {
  assertPlaying(state)
  const have = state.shards ?? 0
  if (have === 0) throw new Error('Nie masz Shardów')

  let resource: 'attack' | 'recruit' = 'attack'
  if (state.shardsAsRecruitThisTurn) {
    const choice = await ui.chooseOption(
      [
        { id: 'attack', label: '+1 Attack per Shard' },
        { id: 'recruit', label: '+1 Recruit per Shard' },
      ],
      'Spend Shards for…',
    )
    if (!choice) return
    resource = choice === 'recruit' ? 'recruit' : 'attack'
  }

  const count = await ui.chooseNumber(`Spend Shards: +1 ${resource === 'recruit' ? 'Recruit' : 'Attack'} each`, {
    min: 0,
    max: have,
    initial: 1,
  })
  if (count > 0) spendShards(state, count, resource)
}
