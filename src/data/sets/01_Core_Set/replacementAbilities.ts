import { registerWoundReplacement } from '../../../engine/replacements'
import { drawCards } from '../../../engine/game'

registerWoundReplacement('hero-captain-america-diving-block', async (state, ui, self) => {
  const choice = await ui.chooseOptionWithCard(
    self,
    [
      { id: 'reveal', label: 'Dobierz kartę zamiast rany' },
      { id: 'no', label: 'Zdobądź ranę normalnie' },
    ],
    'Zdobywasz ranę',
  )

  if (choice === 'reveal') {
    await ui.showInfo(self, 'Ujawniono: Diving Block')
    drawCards(state, 1)
    return true
  }
  return false
})
