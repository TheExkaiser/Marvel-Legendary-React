import { chooseOneCard, revealOneOr } from '../../../engine/abilityHelpers'
import { registerCardAbility } from '../../../engine/cardAbilities'
import { getCardData } from '../../../engine/cardData'
import { chargeVillain } from '../../../engine/charge'
import { isCityDestroyed } from '../../../engine/cityLayout'
import { CITY_NAMES } from '../../../engine/constants'
import { discardCard, koCard, revealCards } from '../../../engine/keywords'
import { patrolCitySpace } from '../../../engine/patrol'
import { shuffle } from '../../../engine/random'
import { enterCity, revealTopVillainCards } from '../../../engine/villainPhase'
import { logEvent } from '../../../engine/common'
import { refillHq } from '../../../engine/recruit'
import type { CardInstance } from '../../../engine/types'
import { gainWound } from '../../../engine/wounds'
import { IMMORTAL_EMPEROR_ZHENG_ZHU, KING_HYPERION, SHIKLAH_THE_DEMON_BRIDE, SPIDER_QUEEN } from './cards'
import { discardDownTo, isSpiderInfected } from './tacticAbilities'
import { ANGELA_STRIKE_ID, DEADPOOL_STRIKE_ID, PROFESSOR_X_STRIKE_ID, WARRIOR_WOMAN_STRIKE_ID } from './villainAbilities'

// Zheng-Zhu: ujawnij Bohatera kosztującego 7 lub więcej albo odrzuć do 3 kart
registerCardAbility(IMMORTAL_EMPEROR_ZHENG_ZHU.masterStrikeId, async (state, { ui }) => {
  const expensive = revealCards(state).filter((card) => {
    const data = getCardData(state, card)
    return !!data.hero && (data.cost ?? 0) >= 7
  })
  await revealOneOr(
    ui,
    expensive,
    'Master Strike: reveal a Hero that costs 7 or more',
    'Revealed a Hero that costs 7 or more',
    () => discardDownTo(state, ui, 3, 'Master Strike'),
  )
})

// King Hyperion: wchodzi do miasta, jeśli jeszcze go tam nie ma, potem szarżuje o trzy pola
registerCardAbility(KING_HYPERION.masterStrikeId, async (state, { ui }) => {
  const king = (state.masterminds ?? [state.mastermind]).find((card) => card.cardId === KING_HYPERION.card.id)
  if (!king) return
  if (!state.city.some((card) => card?.instanceId === king.instanceId)) await enterCity(state, king, ui)
  await chargeVillain(state, ui, king, 3)
})

// Shiklah: Scheme Twisty na wierzch talii Villainów (koniec tablicy), reszta na spód w losowej kolejności (początek tablicy)
registerCardAbility(SHIKLAH_THE_DEMON_BRIDE.masterStrikeId, async (state, { ui }) => {
  const revealed = await revealTopVillainCards(state, ui, 3, 'Shiklah Master Strike: top 3 cards of the Villain Deck')
  const twists = revealed.filter((card) => state.cards[card.cardId].kind === 'twist')
  const rest = revealed.filter((card) => state.cards[card.cardId].kind !== 'twist')
  state.villainDeck.unshift(...shuffle(rest))
  state.villainDeck.push(...twists)
})

// Spider-Queen: Spider-Infected z Victory Pile do pustego pola miasta (bez Ambush: "put into"), a kto nie może, zdobywa Wounda
registerCardAbility(SPIDER_QUEEN.masterStrikeId, async (state, { ui }) => {
  const infected = state.defeated.filter((card) => isSpiderInfected(state, card))
  const emptySpaces = state.city.flatMap((card, index) => (!card && !isCityDestroyed(state, index) ? [index] : []))
  if (infected.length === 0 || emptySpaces.length === 0) {
    await gainWound(state, ui)
    return
  }
  const chosen = await chooseOneCard(ui, infected, 'Spider-Queen Master Strike: put a Spider-Infected from your Victory Pile into an empty city space')
  if (!chosen) return
  let target = emptySpaces[0]
  if (emptySpaces.length > 1) {
    const slot = await ui.chooseOption(
      emptySpaces.map((index) => ({ id: String(index), label: CITY_NAMES[index] })),
      'Spider-Queen Master Strike: choose an empty city space',
    )
    target = Number(slot)
  }
  state.defeated.splice(state.defeated.findIndex((card) => card.instanceId === chosen.instanceId), 1)
  state.city[target] = chosen
})

// ---------- Master Strike'i Villainów, którzy wznieśli się na Mastermina ----------

// Deadpool: ujawnij Bohatera z nieparzystym kosztem (0 jest parzyste) albo Wound
registerCardAbility(DEADPOOL_STRIKE_ID, async (state, { ui }) => {
  const odd = revealCards(state).filter((card) => {
    const data = getCardData(state, card)
    return !!data.hero && (data.cost ?? 0) % 2 === 1
  })
  await revealOneOr(
    ui,
    odd,
    'Master Strike: reveal a Hero with an odd-numbered cost',
    'Revealed a Hero with an odd-numbered cost',
    () => gainWound(state, ui),
  )
})

// Angela: KO Bohatera z discardu kosztującego 1 lub więcej
registerCardAbility(ANGELA_STRIKE_ID, async (state, { ui }) => {
  const heroes = state.discard.filter((card) => {
    const data = getCardData(state, card)
    return !!data.hero && (data.cost ?? 0) >= 1
  })
  const chosen = await chooseOneCard(ui, heroes, 'Master Strike: KO a Hero from your discard pile that costs 1 or more')
  if (chosen) koCard(state, chosen.instanceId)
})

// Warrior Woman: Patrol the Bank, jeśli stoi tam Villain, odrzuć kartę z ikoną Recruit
registerCardAbility(WARRIOR_WOMAN_STRIKE_ID, async (state, { ui }) => {
  if (patrolCitySpace(state, 'Bank') !== 'occupied') return
  const options = state.hand.filter((card) => getCardData(state, card).recruit !== undefined)
  const chosen = await chooseOneCard(ui, options, 'Master Strike: discard a card with a Recruit icon')
  if (chosen) await discardCard(state, chosen.instanceId, ui)
})

// '92 Professor X: dwóch Bohaterów z HQ o najwyższym koszcie trafia na stos obok niego (remis wybiera gracz).
// Kolejność stosu: pierwszy (najdroższy) leży na dole, drugi na wierzchu. +1 Attack za każdego Bohatera na stosie
// to mastermindAttackModifiers; rekrutacja z wierzchu stosu: recruitFromMastermindStack (recruit.ts).
registerCardAbility(PROFESSOR_X_STRIKE_ID, async (state, { ui }) => {
  const entry = Object.entries(state.mastermindStrikeIds ?? {}).find(([, strikeId]) => strikeId === PROFESSOR_X_STRIKE_ID)
  if (!entry) return
  const mastermindId = entry[0]
  const cost = (card: CardInstance): number => state.cards[card.cardId].cost ?? 0
  const stacked: CardInstance[] = []
  for (let n = 0; n < 2; n++) {
    const heroes = state.hq.flatMap((card) => (card && getCardData(state, card).hero ? [card] : []))
    if (heroes.length === 0) break
    const highest = Math.max(...heroes.map(cost))
    const chosen = await chooseOneCard(
      ui,
      heroes.filter((card) => cost(card) === highest),
      "Master Strike: stack the Hero with the highest cost next to '92 Professor X",
    )
    if (!chosen) break
    state.hq[state.hq.findIndex((card) => card?.instanceId === chosen.instanceId)] = null
    stacked.push(chosen)
  }
  const stack = state.mastermindHeroStacks?.[mastermindId] ?? []
  stack.push(...stacked)
  state.mastermindHeroStacks = { ...state.mastermindHeroStacks, [mastermindId]: stack }
  state.mastermindAttackModifiers = { ...state.mastermindAttackModifiers, [mastermindId]: stack.length }
  refillHq(state)
  if (stacked.length > 0) logEvent(state, `'92 Professor X: stacked ${stacked.map((card) => state.cards[card.cardId].name).join(', ')}`)
})
