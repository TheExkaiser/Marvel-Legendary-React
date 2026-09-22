import type { CardInstance } from '../../../engine/types'
import { registerCardAbility } from '../../../engine/cardAbilities'
import { drawCards, rescueBystander, defeatVillainFree, claimTacticFree } from '../../../engine/game'
import { countPlayedThisTurn, countBystandersInPile, hasCaptiveBystander, koCard } from '../../../engine/keywords'

registerCardAbility('hero-black-widow-dangerous-rescue', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'covert' }) === 0) return

  const options = [...state.hand, ...state.discard]
  if (options.length === 0) return

  const chosen = await ui.choose(options, {
    prompt: 'Dangerous Rescue: możesz KO kartę z ręki lub stosu odrzuconych',
    optional: true,
  })
  if (!chosen) return

  koCard(state, chosen.instanceId)
  rescueBystander(state)
})

registerCardAbility('hero-black-widow-mission-accomplished', async (state) => {
  drawCards(state, 1)
  if (countPlayedThisTurn(state, { type: 'tech' }) > 0) {
    rescueBystander(state)
  }
})

registerCardAbility('hero-black-widow-covert-operation', async (state) => {
  state.attack += countBystandersInPile(state, state.defeated)
})

registerCardAbility('hero-black-widow-silent-sniper', async (state, { ui }) => {
  const targets: CardInstance[] = [
    ...state.city.filter((c): c is CardInstance => !!c && hasCaptiveBystander(state, c)),
    ...(hasCaptiveBystander(state, state.mastermind) ? [state.mastermind] : []),
  ]
  if (targets.length === 0) return

  const chosen =
    targets.length === 1
      ? targets[0]
      : await ui.choose(targets, { prompt: 'Silent Sniper: wybierz cel z Bystanderem', optional: false })
  if (!chosen) return

  if (chosen.instanceId === state.mastermind.instanceId) {
    claimTacticFree(state, ui)
  } else {
    defeatVillainFree(state, chosen.instanceId)
  }
})