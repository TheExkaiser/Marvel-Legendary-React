import { registerCardAbility } from '../../../engine/cardAbilities'
import { revealCards } from '../../../engine/keywords'

registerCardAbility('mastermind-drdoom-master-strike', async (state, { ui }) => {
  if (state.hand.length !== 6) return

  const techHeroes = revealCards(state, { type: 'tech' })

  if (techHeroes.length > 0) {
    await ui.showInfo(techHeroes[0], 'Master Strike: ujawniono Tech Hero')
    return
  }

  for (let i = 0; i < 2 && state.hand.length > 0; i++) {
    const chosen = await ui.choose(state.hand, {
      prompt: `Master Strike: połóż kartę na wierzchu talii (${i + 1}/2)`,
      optional: false,
    })
    if (!chosen) break

    const index = state.hand.findIndex((c) => c.instanceId === chosen.instanceId)
    if (index === -1) break
    const [card] = state.hand.splice(index, 1)
    state.deck.push(card) // koniec tablicy = wierzch talii (drawCards używa pop())
  }
})