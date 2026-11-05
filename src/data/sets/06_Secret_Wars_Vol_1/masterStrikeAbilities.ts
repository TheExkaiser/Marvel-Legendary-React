import { registerCardAbility } from '../../../engine/cardAbilities'
import { getCardData } from '../../../engine/cardData'
import { discardCard, revealCards } from '../../../engine/keywords'
import { gainWound } from '../../../engine/wounds'
import { koFromHq, refillHq } from '../../../engine/recruit'
import { crossDimensionalRampage } from '../../../engine/rampage'
import { riseOfTheLivingDead } from '../../../engine/riseOfTheLivingDead'
import {
  chooseIcon,
  discardChosen,
  hasIcon,
  isExpensiveHero,
  madelyneCaptures,
  madelyneHasBystanders,
} from './tacticAbilities'
import { MADELYNE_PRYOR, NIMROD_SUPER_SENTINEL, WASTELAND_HULK, ZOMBIE_GREEN_GOBLIN } from './cards'

registerCardAbility(MADELYNE_PRYOR.masterStrikeId, async (state, { ui }) => {
  const hadBystanders = madelyneHasBystanders(state)
  await madelyneCaptures(state, ui, 4)
  if (hadBystanders) await gainWound(state, ui)
})

registerCardAbility(NIMROD_SUPER_SENTINEL.masterStrikeId, async (state, { ui }) => {
  if (revealCards(state, { type: 'tech' }).some((card) => !!getCardData(state, card).hero)) return
  const icon = await chooseIcon(ui, 'Nimrod Master Strike: choose Recruit or Attack, then discard all your cards with that icon')
  if (!icon) return
  for (const card of [...state.hand]) {
    if (hasIcon(state, card, icon)) await discardCard(state, card.instanceId, ui)
  }
})

registerCardAbility(WASTELAND_HULK.masterStrikeId, async (state, { ui }) => {
  await crossDimensionalRampage(state, ui, 'Hulk')
})

registerCardAbility(ZOMBIE_GREEN_GOBLIN.masterStrikeId, async (state, { ui }) => {
  await riseOfTheLivingDead(state, ui)
  for (let i = 0; i < state.hq.length; i++) {
    const card = state.hq[i]
    if (card && isExpensiveHero(state, card)) koFromHq(state, i)
  }
  refillHq(state)
  const count = state.ko.filter((card) => isExpensiveHero(state, card)).length
  await discardChosen(state, ui, count, 'Zombie Green Goblin Master Strike: discard a card')
})
