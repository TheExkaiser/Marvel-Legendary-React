import { registerCardAbility } from '../../../engine/cardAbilities'
import { chooseOneCard, revealOneOr } from '../../../engine/abilityHelpers'
import { getCardData } from '../../../engine/cardData'
import { drawRevealed, putCardsOnTop } from '../../../engine/deckOps'
import { discardCard, isVillainCard, koCard, revealCards, revealTopCards } from '../../../engine/keywords'
import { isLedGroupVillain } from '../../../engine/ledGroup'
import { refillHq } from '../../../engine/recruit'
import { riseOfTheLivingDead } from '../../../engine/riseOfTheLivingDead'
import { shuffle } from '../../../engine/random'
import { claimShardsOn, returnShardsOn } from '../../../engine/shards'
import { teleportCard } from '../../../engine/turn'
import { gainWound } from '../../../engine/wounds'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'
import { MADELYNE_PRYOR } from './cards'

// ---------- Wspólne pomocniki (używane też przez masterStrikeAbilities) ----------

const isBystander = (state: GameState, card: CardInstance): boolean => state.cards[card.cardId].kind === 'bystander'

/** Madelyne w tej grze (może być też dodatkowym Mastermindem). */
function madelyne(state: GameState): CardInstance {
  return (state.masterminds ?? [state.mastermind]).find((card) => card.cardId === MADELYNE_PRYOR.card.id) ?? state.mastermind
}

export function madelyneHasBystanders(state: GameState): boolean {
  return (state.captives[madelyne(state).instanceId] ?? []).some((card) => isBystander(state, card))
}

async function captureCard(state: GameState, ui: UiAdapter, bystander: CardInstance): Promise<void> {
  const captor = madelyne(state)
  state.captives[captor.instanceId] = [...(state.captives[captor.instanceId] ?? []), bystander]
  await ui.showCapture(captor, bystander, `Bystander captured by ${state.cards[captor.cardId].name}`)
}

/** Madelyne zabiera `count` Bystanderów ze stosu Bystanderów (każdy staje się Demon Goblinem). */
export async function madelyneCaptures(state: GameState, ui: UiAdapter, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    const bystander = state.bystanders.pop()
    if (!bystander) return
    await captureCard(state, ui, bystander)
  }
}

export type Icon = 'recruit' | 'attack'

export async function chooseIcon(ui: UiAdapter, prompt: string): Promise<Icon | undefined> {
  const choice = await ui.chooseOption(
    [{ id: 'recruit', label: 'Recruit' }, { id: 'attack', label: 'Attack' }],
    prompt,
  )
  if (choice === 'recruit' || choice === 'attack') return choice
  return undefined
}

export const iconLabel = (icon: Icon): string => (icon === 'recruit' ? 'Recruit' : 'Attack')

/** Czy karta ma drukowaną ikonę Recruit lub Attack. */
export const hasIcon = (state: GameState, card: CardInstance, icon: Icon): boolean =>
  getCardData(state, card)[icon] !== undefined

/** Hero (nie Wound ani Bystander), którego koszt wynosi co najmniej 7. */
export const isExpensiveHero = (state: GameState, card: CardInstance): boolean => {
  const data = getCardData(state, card)
  return !!data.hero && (data.cost ?? 0) >= 7
}

const isWound = (state: GameState, card: CardInstance): boolean => state.cards[card.cardId].kind === 'wound'

export async function discardChosen(state: GameState, ui: UiAdapter, count: number, prompt: string): Promise<void> {
  for (let i = 0; i < count && state.hand.length > 0; i++) {
    const chosen = await ui.choose(state.hand, { prompt: `${prompt} (${i + 1}/${count})`, optional: false })
    if (!chosen) break
    await discardCard(state, chosen.instanceId, ui)
  }
}

const risingVillainsInCity = (state: GameState): number =>
  state.city.filter(
    (card) => !!card && isVillainCard(state.cards[card.cardId]) && (state.cards[card.cardId].keywords ?? []).includes('rise-of-the-living-dead'),
  ).length

// ---------- Madelyne Pryor, Goblin Queen ----------

registerCardAbility('secret-wars-madelyne-city-of-demon-goblins', async (state, { ui }) => {
  await madelyneCaptures(state, ui, 5)
})

registerCardAbility('secret-wars-madelyne-corrupted-clone-of-jean-grey', async (state, { ui }) => {
  const xMen = revealCards(state).filter((card) => {
    const data = getCardData(state, card)
    return !!data.hero && (data.team ?? []).some((team) => team.toLowerCase() === 'x-men')
  })
  await revealOneOr(ui, xMen, 'Madelyne: reveal an X-Men Hero', 'Revealed an X-Men Hero', () => gainWound(state, ui))
})

registerCardAbility('secret-wars-madelyne-everyones-a-demon-on-the-inside', async (state, { ui }) => {
  const bystanders = state.defeated.filter((card) => isBystander(state, card))
  const chosen = await chooseOneCard(ui, bystanders, 'Madelyne: capture a Bystander from your Victory Pile')
  if (!chosen) return
  state.defeated.splice(state.defeated.findIndex((card) => card.instanceId === chosen.instanceId), 1)
  await captureCard(state, ui, chosen)
})

registerCardAbility('secret-wars-madelyne-gather-the-harvest', async (state, { ui }) => {
  const count = [...state.city, ...state.escaped].filter((card) => !!card && isLedGroupVillain(state, card)).length
  await madelyneCaptures(state, ui, count)
})

// ---------- Nimrod, Super Sentinel ----------

registerCardAbility('secret-wars-nimrod-adapt-and-destroy', async (state, { ui }) => {
  const icon = await chooseIcon(ui, 'Adapt and Destroy: choose Recruit or Attack')
  if (!icon) return
  if (state.hand.length > 0) await ui.showCards(state.hand, 'Adapt and Destroy: revealed hand')
  const targets = state.hand.filter((card) => hasIcon(state, card, icon))
  const chosen = await chooseOneCard(ui, targets, `Adapt and Destroy: discard a card with a ${iconLabel(icon)} icon`)
  if (chosen) await discardCard(state, chosen.instanceId, ui)
})

registerCardAbility('secret-wars-nimrod-detect-mutation', async (state, { ui }) => {
  const icon = await chooseIcon(ui, 'Detect Mutation: choose Recruit or Attack')
  if (!icon) return
  for (;;) {
    const [revealed] = await revealTopCards(state, ui, 1, 'Detect Mutation')
    if (!revealed) return
    if (!hasIcon(state, revealed, icon)) {
      putCardsOnTop(state, [revealed])
      return
    }
    drawRevealed(state, [revealed])
  }
})

registerCardAbility('secret-wars-nimrod-scatter-the-mutants', async (state, { ui }) => {
  const icon = await chooseIcon(ui, 'Scatter the Mutants: choose Recruit or Attack')
  if (!icon) return
  for (let i = 0; i < state.hq.length; i++) {
    const card = state.hq[i]
    if (!card || !getCardData(state, card).hero || !hasIcon(state, card, icon)) continue
    state.hq[i] = null
    returnShardsOn(state, card)
    state.heroDeck.unshift(card) // spód talii to początek tablicy
  }
  refillHq(state)
})

registerCardAbility('secret-wars-nimrod-teleport-and-incarcerate', async (state, { ui }) => {
  const icon = await chooseIcon(ui, 'Teleport and Incarcerate: choose Recruit or Attack')
  if (!icon) return
  const top = state.heroDeck[state.heroDeck.length - 1]
  if (!top) return
  await ui.revealCard(top, 'Teleport and Incarcerate: top card of the Hero Deck')
  if (!hasIcon(state, top, icon)) return
  state.heroDeck.pop()
  state.hand.push(top)
  await teleportCard(state, top.instanceId, ui, true)
})

// ---------- Wasteland Hulk ----------

registerCardAbility('secret-wars-wasteland-hulk-brutal-beating', async (state, { ui }) => {
  const wounds = state.discard.filter((card) => isWound(state, card)).length
  await discardChosen(state, ui, wounds, 'Brutal Beating: discard a card')
})

registerCardAbility('secret-wars-wasteland-hulk-memories-of-pain', async (state) => {
  const wounds = state.discard.filter((card) => isWound(state, card)).slice(0, 2)
  for (const wound of wounds) {
    state.discard.splice(state.discard.findIndex((card) => card.instanceId === wound.instanceId), 1)
    state.deck.push(wound) // wierzch talii to koniec tablicy
  }
})

registerCardAbility('secret-wars-wasteland-hulk-radioactive-regeneration', async (state, { ui }) => {
  for (let i = 0; i < 2; i++) {
    const wounds = [...state.hand, ...state.discard].filter((card) => isWound(state, card))
    if (wounds.length === 0) return
    const chosen = await ui.choose(wounds, { prompt: `Radioactive Regeneration: KO a Wound (${i + 1}/2)`, optional: true })
    if (!chosen) return
    koCard(state, chosen.instanceId)
  }
})

registerCardAbility('secret-wars-wasteland-hulk-revert-to-bruce-banner', async (state, { ui }) => {
  const techHeroes = state.hq.filter((card): card is CardInstance => {
    if (!card) return false
    const data = getCardData(state, card)
    return !!data.hero && (data.type ?? []).includes('tech')
  })
  const chosen = await chooseOneCard(ui, techHeroes, 'Revert to Bruce Banner: gain a tech Hero from the HQ')
  if (!chosen) return
  const index = state.hq.findIndex((card) => card?.instanceId === chosen.instanceId)
  if (index === -1) return
  state.hq[index] = null
  claimShardsOn(state, chosen)
  state.discard.push(chosen)
  refillHq(state)
})

// ---------- Zombie Green Goblin ----------

registerCardAbility('secret-wars-zombie-green-goblin-army-of-cadavers', async (state, { ui }) => {
  await riseOfTheLivingDead(state, ui)
  await discardChosen(state, ui, risingVillainsInCity(state), 'Army of Cadavers: discard a card')
})

registerCardAbility('secret-wars-zombie-green-goblin-the-hungry-dead', async (state, { ui }) => {
  await riseOfTheLivingDead(state, ui)
  if (risingVillainsInCity(state) > 0) await gainWound(state, ui)
})

registerCardAbility('secret-wars-zombie-green-goblin-love-to-have-you-for-dinner', async (state, { ui }) => {
  await riseOfTheLivingDead(state, ui)
  const revealed = state.heroDeck.splice(Math.max(0, state.heroDeck.length - 5), 5)
  if (revealed.length === 0) return
  await ui.showCards(revealed, 'Love to Have You for Dinner: top 5 cards of the Hero Deck')
  const rest: CardInstance[] = []
  for (const card of revealed) {
    if (isExpensiveHero(state, card)) state.ko.push(card)
    else rest.push(card)
  }
  state.heroDeck.unshift(...shuffle(rest))
})

registerCardAbility('secret-wars-zombie-green-goblin-reign-of-terror', async (state, { ui }) => {
  await riseOfTheLivingDead(state, ui)
  for (let i = 0; i < state.hq.length; i++) {
    const card = state.hq[i]
    if (!card || !getCardData(state, card).hero || (getCardData(state, card).cost ?? 0) > 6) continue
    state.hq[i] = null
    returnShardsOn(state, card)
    state.heroDeck.unshift(card)
  }
  refillHq(state)
})
