import { registerCardAbility } from '../../../engine/cardAbilities'
import { drawCards } from '../../../engine/game'
import { koCard } from '../../../engine/keywords'
import { getCardData } from '../../../engine/cardData'

registerCardAbility('bystander-news-reporter', async (state) => {
  drawCards(state, 1)
})

registerCardAbility('bystander-paramedic', async (state, { ui }) => {
  const wounds = [...state.hand, ...state.discard].filter((c) => state.cards[c.cardId].kind === 'wound')
  if (wounds.length === 0) return
  const chosen = await ui.choose(wounds, {
    prompt: 'Paramedic: możesz KO ranę z ręki lub stosu odrzuconych',
    optional: true,
  })
  if (chosen) koCard(state, chosen.instanceId)
})

registerCardAbility('bystander-radiation-scientist', async (state, { ui }) => {
  const heroes = state.discard.filter((c) => getCardData(state, c).kind === undefined)
  if (heroes.length === 0) return
  const chosen = await ui.choose(heroes, {
    prompt: 'Radiation Scientist: możesz KO Bohatera ze stosu odrzuconych',
    optional: true,
  })
  if (chosen) koCard(state, chosen.instanceId)
})
