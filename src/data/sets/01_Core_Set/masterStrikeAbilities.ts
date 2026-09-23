import { registerCardAbility } from '../../../engine/cardAbilities'

registerCardAbility('mastermind-drdoom-master-strike', async (state, { ui }) => {
  if (state.hand.length !== 6) return

  const heroCard = state.hand.find((c) => state.cards[c.cardId].hero !== undefined)

  if (heroCard) {
    await ui.showInfo(heroCard, 'Master Strike: ujawniono bohatera')
  } else {
    for (let i = 0; i < 2 && state.hand.length > 0; i++) {
      const [card] = state.hand.splice(0, 1) // TODO: pozwolić graczowi wybrać KTÓRE karty
      state.deck.push(card)
    }
  }
})