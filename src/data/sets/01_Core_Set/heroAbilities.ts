import { registerCardAbility } from '../../../engine/cardAbilities'
import { drawCards, rescueBystander, defeatVillainFree, claimTacticFree } from '../../../engine/game'
import {
  countPlayedThisTurn,
  countBystandersInPile,
  hasCaptiveBystander,
  countDistinctTypes,
  discardCard,
  koCard,
  haveZone,
  revealCards,
} from '../../../engine/keywords'
import { registerPlayRequirement } from '../../../engine/cardRequirements'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'
import { registerDiscardReplacement } from '../../../engine/replacements'
import { villainPhase } from '../../../engine/villainPhase'

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
    await claimTacticFree(state, ui)
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

// ---------- Deadpool ----------

registerCardAbility('hero-deadpool-here-hold-this-for-a-second', async (state, { ui }) => {
  const villains = state.city.filter((c): c is CardInstance => !!c)
  const bystander = state.bystanders[state.bystanders.length - 1]
  if (villains.length === 0 || !bystander) return

  const target =
    villains.length === 1
      ? villains[0]
      : await ui.choose(villains, {
          prompt: 'Wybierz złoczyńcę, który porwie Bystandera',
          optional: false,
        })
  if (!target) return

  state.bystanders.pop()
  const list = state.captives[target.instanceId] ?? []
  list.push(bystander)
  state.captives[target.instanceId] = list
})

registerCardAbility('hero-deadpool-oddball', async (state) => {
  const odd = state.cardsPlayedThisTurn.filter((c) => {
    const data = state.cards[c.cardId]
    return !!data.hero && (data.cost ?? 0) % 2 === 1
  }).length
  state.attack += odd
})

registerCardAbility('hero-deadpool-hey-can-i-get-a-do-over', async (state, { ui, self }) => {
  if (state.cardsPlayedThisTurn.length !== 0) return // musi być pierwszym zagranym Bohaterem

  const chosen = await ui.choose([self], {
    prompt: 'Do-Over: odrzucić resztę ręki i dobrać 4 karty?',
    optional: true,
  })
  if (!chosen) return

  for (const card of [...state.hand]) {
    if (card.instanceId !== self.instanceId) await discardCard(state, card.instanceId, ui)
  }
  drawCards(state, 4)
})

registerCardAbility('hero-deadpool-random-acts-of-unkindness', async (state, { ui, self }) => {
  const chosen = await ui.choose([self], {
    prompt: 'Random Acts of Unkindness: chcesz zyskać Wound do ręki?',
    optional: true,
  })
  if (chosen) {
    const wound = state.wounds.pop()
    if (wound) state.hand.push(wound)
  }
  drawCards(state, 1)
})

// ---------- Emma Frost ----------

registerCardAbility('hero-emma-frost-mental-discipline', async (state) => {
  drawCards(state, 1)
})

registerCardAbility('hero-emma-frost-shadowed-thoughts', async (state, { ui, self }) => {
  if (countPlayedThisTurn(state, { type: 'covert' }) === 0) return
  if (state.villainDeck.length === 0) return

  const chosen = await ui.choose([self], {
    prompt: 'Shadowed Thoughts: zagrać wierzchnią kartę talii złoczyńców (+2 Attack)?',
    optional: true,
  })
  if (!chosen) return

  await villainPhase(state, ui)
  state.attack += 2
})

registerCardAbility('hero-emma-frost-psychic-link', async (state, { self }) => {
  const others = revealCards(state, { team: 'x-men' }).filter(
    (c) => c.instanceId !== self.instanceId,
  )
  if (others.length > 0) drawCards(state, 1)
})

registerCardAbility('hero-emma-frost-diamond-form', async (state) => {
  state.defeatRecruitBonus = (state.defeatRecruitBonus ?? 0) + 3
})