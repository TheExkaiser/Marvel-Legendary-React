import { registerCardAbility } from '../../../engine/cardAbilities'
import { revealCards } from '../../../engine/keywords'
import { gainWound } from '../../../engine/game'

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

registerCardAbility('mastermind-loki-master-strike', async (state, { ui }) => {
  const strengthHeroes = revealCards(state, { type: 'strength' })

  if (strengthHeroes.length > 0) {
    await ui.showInfo(strengthHeroes[0], 'Master Strike: revealed a Strength Hero')
    return
  }

  await gainWound(state, ui)
})

registerCardAbility('mastermind-magneto-master-strike', async (state, { ui }) => {
  const xmenHeroes = revealCards(state, { team: 'x-men' })

  if (xmenHeroes.length > 0) {
    await ui.showInfo(xmenHeroes[0], 'Master Strike: revealed an X-Men Hero')
    return
  }

  while (state.hand.length > 4) {
    const chosen = await ui.choose(state.hand, {
      prompt: `Master Strike: discard down to four cards (${state.hand.length} in hand)`,
      optional: false,
    })
    if (!chosen) break

    const index = state.hand.findIndex((c) => c.instanceId === chosen.instanceId)
    if (index === -1) break
    const [card] = state.hand.splice(index, 1)
    state.discard.push(card)
  }
})

registerCardAbility('mastermind-redskull-master-strike', async (state, { ui }) => {
  const heroesInHand = state.hand.filter((c) => !!state.cards[c.cardId].hero)
  if (heroesInHand.length === 0) return

  const chosen = await ui.choose(heroesInHand, {
    prompt: 'Master Strike: KO a Hero from your hand',
    optional: false,
  })
  if (!chosen) return

  const index = state.hand.findIndex((c) => c.instanceId === chosen.instanceId)
  if (index === -1) return
  const [card] = state.hand.splice(index, 1)
  state.ko.push(card)
})