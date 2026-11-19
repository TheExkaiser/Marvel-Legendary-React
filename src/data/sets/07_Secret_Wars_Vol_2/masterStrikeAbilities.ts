import { chooseOneCard, revealOneOr } from '../../../engine/abilityHelpers'
import { registerCardAbility } from '../../../engine/cardAbilities'
import { getCardData } from '../../../engine/cardData'
import { chargeVillain } from '../../../engine/charge'
import { isCityDestroyed } from '../../../engine/cityLayout'
import { CITY_NAMES } from '../../../engine/constants'
import { revealCards } from '../../../engine/keywords'
import { shuffle } from '../../../engine/random'
import { enterCity, revealTopVillainCards } from '../../../engine/villainPhase'
import { gainWound } from '../../../engine/wounds'
import { IMMORTAL_EMPEROR_ZHENG_ZHU, KING_HYPERION, SHIKLAH_THE_DEMON_BRIDE, SPIDER_QUEEN } from './cards'
import { discardDownTo, isSpiderInfected } from './tacticAbilities'

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
