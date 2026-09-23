import { registerCardAbility } from '../../../engine/cardAbilities'
import { drawCards, rescueBystander, defeatVillainFree, claimTacticFree } from '../../../engine/game'
import {
  countPlayedThisTurn,
  countBystandersInPile,
  hasCaptiveBystander,
  countDistinctTypes,
  discardCard,
  koCard,
  haveZone
} from '../../../engine/keywords'
import { registerPlayRequirement } from '../../../engine/cardRequirements'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'
import { registerDiscardReplacement } from '../../../engine/replacements'

// ---------- Black Widow ----------

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
    await claimTacticFree(state, ui) // <-- naprawione: teraz z drugim argumentem `ui`
  } else {
    defeatVillainFree(state, chosen.instanceId)
  }
})

// ---------- Captain America ----------

registerCardAbility('hero-captain-america-avengers-assemble', async (state) => {
  state.recruit += countDistinctTypes(state, haveZone(state))
})

registerCardAbility('hero-captain-america-perfect-teamwork', async (state) => {
  state.recruit += countDistinctTypes(state, haveZone(state))
})

registerCardAbility('hero-captain-america-day-unlike-any-other', async (state) => {
  const count = countPlayedThisTurn(state, { team: 'avengers' })
  if (count === 0) return
  state.attack += 3 * count
})

// ---------- Cyclops ----------

async function discardCost(state: GameState, ui: UiAdapter): Promise<void> {
  const chosen = await ui.choose(state.hand, {
    prompt: 'Wybierz kartę do odrzucenia (koszt zagrania)',
    optional: false,
  })
  if (chosen) await discardCard(state, chosen.instanceId, ui)
}

// Karta wymaga odrzucenia innej karty z ręki - musisz mieć w ręce jeszcze coś poza nią samą
function requiresAnotherCardInHand(state: GameState): boolean {
  return state.hand.length >= 2 // sama karta jest jeszcze w ręce w momencie sprawdzania
}

registerPlayRequirement('hero-cyclops-determination', requiresAnotherCardInHand)
registerPlayRequirement('hero-cyclops-optic-blast', requiresAnotherCardInHand)

registerCardAbility('hero-cyclops-determination', async (state, { ui }) => {
  await discardCost(state, ui)
})

registerCardAbility('hero-cyclops-optic-blast', async (state, { ui }) => {
  await discardCost(state, ui)
})

registerCardAbility('hero-cyclops-x-men-united', async (state) => {
  const count = countPlayedThisTurn(state, { team: 'x-men' })
  if (count === 0) return
  state.attack += 2 * count
})

registerDiscardReplacement('hero-cyclops-unending-energy', async (state, ui, self) => {
  const chosen = await ui.choose([self], {
    prompt: 'Unending Energy: chcesz zatrzymać tę kartę w ręce zamiast ją odrzucić?',
    optional: true,
  })
  return !!chosen // true = gracz zostawia kartę, normalne odrzucenie jest pomijane
})