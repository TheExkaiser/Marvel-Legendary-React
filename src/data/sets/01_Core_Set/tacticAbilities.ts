import { registerCardAbility } from '../../../engine/cardAbilities'
import { recruitHero, drawCards } from '../../../engine/game'
import type { CardInstance } from '../../../engine/types'

registerCardAbility('drdoom-dark-technology', async (state, { ui }) => {
  const targets = state.hq.filter(
    (c): c is CardInstance =>
      !!c &&
      ((state.cards[c.cardId].type ?? []).includes('tech') ||
        (state.cards[c.cardId].type ?? []).includes('ranged')),
  )
  if (targets.length === 0) return

  const chosen = await ui.choose(targets, {
    prompt: 'Dark Technology: możesz zwerbować Tech lub Ranged bohatera za darmo',
    optional: true,
  })
  if (!chosen) return

  // Werbunek za darmo: chwilowo podbijamy recruit o koszt karty, żeby recruitHero przepuścił akcję
  const cost = state.cards[chosen.cardId].cost ?? 0
  state.recruit += cost
  recruitHero(state, chosen.instanceId)
})

registerCardAbility('drdoom-monarchs-decree', async (state, { ui }) => {
  const choice = await ui.chooseOption(
    [
      { id: 'draw', label: 'Dobierz kartę' },
      { id: 'discard', label: 'Odrzuć kartę' },
    ],
    "Monarch's Decree: wybierz efekt",
  )

  if (choice === 'draw') {
    drawCards(state, 1)
  } else if (choice === 'discard' && state.hand.length > 0) {
    const [card] = state.hand.splice(0, 1) // TODO: pozwolić graczowi wybrać KTÓRĄ kartę odrzucić
    state.discard.push(card)
  }
})

registerCardAbility('drdoom-secrets-of-time-travel', async (state) => {
  state.extraTurnsQueued += 1
})

registerCardAbility('drdoom-treasures-of-latveria', async (state) => {
  state.bonusDrawNextTurn += 3
})