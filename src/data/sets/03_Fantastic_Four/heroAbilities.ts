import { registerCardAbility } from '../../../engine/cardAbilities'
import { gainWound, addRecruit, addAttack, rescueBystander } from '../../../engine/game'
import { koCard, countPlayedThisTurn, koFromHandOrDiscard } from '../../../engine/keywords'
import { getCardData } from '../../../engine/cardData'
import { registerFocusEffect } from '../../../engine/focus'

// ---------- Human Torch ----------

registerCardAbility('hero-human-torch-call-for-backup', async (state, { ui }) => {
  const wounds = [...state.hand, ...state.discard].filter(
    (c) => state.cards[c.cardId].kind === 'wound',
  )
  if (wounds.length === 0) return

  const chosen = await ui.choose(wounds, {
    prompt: 'Call for Backup: możesz KO Ranę z ręki lub stosu odrzuconych (+1 Recruit)',
    optional: true,
  })
  if (!chosen) return

  koCard(state, chosen.instanceId)
  addRecruit(state, 1)
})

registerCardAbility('hero-human-torch-hothead', async (state, { ui }) => {
  await gainWound(state, ui)
})

// Flame On!: sam przycisk i koszt (focus: 6) są w silniku, tu tylko efekt
registerFocusEffect('hero-human-torch-flame-on', async (state) => {
  addAttack(state, 4)
})

// Nova Flame: Fantastic Four = inna zagrana karta tej drużyny. Liczy zajęte pola miasta
registerCardAbility('hero-human-torch-nova-flame', async (state) => {
  if (countPlayedThisTurn(state, { team: 'fantastic-four' }) === 0) return
  addAttack(state, state.city.filter((c) => c !== null).length)
})

// ---------- Invisible Woman ----------

registerFocusEffect('hero-invisible-woman-disappearing-act', async (state, ui) => {
  await koFromHandOrDiscard(state, ui, 'Disappearing Act: możesz KO kartę z ręki lub stosu odrzuconych')
})

// "Any other cards": karta jest dopisana do cardsPlayedThisTurn dopiero po zdolności
registerCardAbility('hero-invisible-woman-four-of-a-kind', async (state) => {
  const otherCostFour = state.cardsPlayedThisTurn.filter((c) => getCardData(state, c).cost === 4)
  if (otherCostFour.length === 0) return
  addAttack(state, 2)
})

// Limit 4 użyć na turę to dane karty (focusLimit), pilnuje go engine/focus.ts
registerFocusEffect('hero-invisible-woman-unseen-rescue', async (state) => {
  await rescueBystander(state)
})
