import { registerCardAbility } from '../../../engine/cardAbilities'
import { revealCards, discardCard } from '../../../engine/keywords'
import { drawCards, gainWound } from '../../../engine/game'
import { captureFromSupply, captureForSinister, sinisterBystanderCount } from './sinisterCaptives'
import { shuffle } from '../../../engine/random'


registerCardAbility('mastermind-apocalypse-master-strike', async (state) => {
  const toTop = state.hand.filter((c) => {
    const data = state.cards[c.cardId]
    return !!data.hero && (data.cost ?? 0) >= 1
  })
  if (toTop.length === 0) return

  state.hand = state.hand.filter((c) => !toTop.includes(c))
  state.deck.push(...toTop) // koniec tablicy = wierzch talii
})

registerCardAbility('mastermind-kingpin-master-strike', async (state, { ui }) => {
  const knights = revealCards(state, { team: 'marvel-knights' })

  if (knights.length > 0) {
    await ui.showInfo(knights[0], 'Master Strike: revealed a Marvel Knights Hero')
    return
  }

  for (const card of [...state.hand]) {
    await discardCard(state, card.instanceId, ui) // przez discardCard, bo działają zamienniki (Diving Catch)
  }
  drawCards(state, 5)
})

registerCardAbility('mastermind-mephisto-master-strike', async (state, { ui }) => {
  const knights = revealCards(state, { team: 'marvel-knights' })

  if (knights.length > 0) {
    await ui.showInfo(knights[0], 'Master Strike: revealed a Marvel Knights Hero')
    return
  }

  await gainWound(state, ui)
})

registerCardAbility('mastermind-mr-sinister-master-strike', async (state, { ui }) => {
  const captured = captureFromSupply(state, 1)
  captureForSinister(state, captured)
  if (captured[0]) await ui.showCapture(state.mastermind, captured[0], 'Bystander captured by Mr. Sinister')

  if (state.hand.length !== 6) return

  const covert = revealCards(state, { type: 'covert' })
  if (covert.length > 0) {
    await ui.showInfo(covert[0], 'Master Strike: revealed a Covert Hero')
    return
  }

  const count = sinisterBystanderCount(state)
  for (let i = 0; i < count && state.hand.length > 0; i++) {
    const chosen = await ui.choose(state.hand, {
      prompt: `Master Strike: discard a card (${i + 1}/${count})`,
      optional: false,
    })
    if (!chosen) break
    await discardCard(state, chosen.instanceId, ui)
  }
})

registerCardAbility('mastermind-stryfe-master-strike', async (state, { self, ui }) => {
  state.stackedMasterStrikes = [...(state.stackedMasterStrikes ?? []), self]

  const xforce = revealCards(state, { team: 'x-force' })
  if (xforce.length > 0) {
    await ui.showInfo(xforce[0], 'Master Strike: revealed an X-Force Hero')
    return
  }

  if (state.hand.length === 0) return
  const [random] = shuffle([...state.hand])
  await discardCard(state, random.instanceId, ui) // przez discardCard, bo działają zamienniki (Diving Catch)
})