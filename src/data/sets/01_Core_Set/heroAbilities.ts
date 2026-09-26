import { registerCardAbility } from '../../../engine/cardAbilities'
import { drawCards, rescueBystander, gainWound, defeatVillainFree, claimTacticFree } from '../../../engine/game'
import {
  countPlayedThisTurn,
  countDistinctHeroesPlayedThisTurn,
  countBystandersInPile,
  hasCaptiveBystander,
  countDistinctTypes,
  hasCard,
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

registerCardAbility('hero-cyclops-x-men-united', async (state, { self }) => {
  const ownHero = state.cards[self.cardId].hero
  const count = countDistinctHeroesPlayedThisTurn(state, { team: 'x-men' }, self.instanceId, ownHero)
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

// ---------- Gambit ----------

registerCardAbility('hero-gambit-card-shark', async (state, { ui }) => {
  const top = state.deck[state.deck.length - 1]
  if (!top) return
  await ui.showInfo(top, 'Card Shark: odkryto wierzchnią kartę talii')
  const data = state.cards[top.cardId]
  if (data.team?.includes('x-men')) {
    drawCards(state, 1)
  }
})

registerCardAbility('hero-gambit-stack-the-deck', async (state, { ui }) => {
  drawCards(state, 2)
  const chosen = await ui.choose(state.hand, {
    prompt: 'Stack the Deck: wybierz kartę do odłożenia na wierzch talii',
    optional: false,
  })
  if (!chosen) return
  const index = state.hand.findIndex((c) => c.instanceId === chosen.instanceId)
  if (index === -1) return
  const [card] = state.hand.splice(index, 1)
  state.deck.push(card)
})

registerCardAbility('hero-gambit-hypnotic-charm', async (state, { ui }) => {
  const resolveOne = async () => {
    const top = state.deck[state.deck.length - 1]
    if (!top) return
    const choice = await ui.chooseOptionWithCard(
      top,
      [
        { id: 'discard', label: 'Discard' },
        { id: 'put-back', label: 'Put back' },
      ],
      'Hypnotic Charm: odkryto wierzchnią kartę talii',
    )
    if (choice === 'discard') {
      state.deck.pop()
      state.discard.push(top)
    }
    // 'put-back' (lub zamknięcie okna) = karta zostaje na wierzchu, nic nie robimy
  }

  await resolveOne()
  if (countPlayedThisTurn(state, { type: 'instinct' }) > 0) {
    await resolveOne()
  }
})

registerCardAbility('hero-gambit-high-stakes-jackpot', async (state, { ui }) => {
  const top = state.deck[state.deck.length - 1]
  if (!top) return
  await ui.showInfo(top, 'High Stakes Jackpot: odkryto wierzchnią kartę talii')
  state.attack += state.cards[top.cardId].cost ?? 0
})

// ---------- Hawkeye ----------

registerCardAbility('hero-hawkeye-quick-draw', async (state) => {
  drawCards(state, 1)
})

registerCardAbility('hero-hawkeye-team-player', async (state) => {
  if (hasCard(state, { team: 'avengers' })) {
    state.attack += 1
  }
})

registerCardAbility('hero-hawkeye-impossible-trick-shot', async (state) => {
  state.defeatRescueBonus = (state.defeatRescueBonus ?? 0) + 3
})

registerCardAbility('hero-hawkeye-covering-fire', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'tech' }) === 0) return

  const choice = await ui.chooseOption(
    [
      { id: 'draw', label: 'Draw a card' },
      { id: 'discard', label: 'Discard a card' },
    ],
    'Covering Fire: wybierz efekt',
  )

  if (choice === 'draw') {
    drawCards(state, 1)
  } else if (choice === 'discard' && state.hand.length > 0) {
    const chosen = await ui.choose(state.hand, {
      prompt: 'Covering Fire: wybierz kartę do odrzucenia',
      optional: false,
    })
    if (chosen) await discardCard(state, chosen.instanceId, ui)
  }
})

// ---------- Hulk ----------

registerCardAbility('hero-hulk-growing-anger', async (state) => {
  if (countPlayedThisTurn(state, { type: 'strength' }) > 0) {
    state.attack += 1
  }
})

registerCardAbility('hero-hulk-unstoppable-hulk', async (state, { ui }) => {
  const options = [...state.hand, ...state.discard].filter(
    (c) => state.cards[c.cardId].kind === 'wound',
  )
  if (options.length === 0) return

  const chosen = await ui.choose(options, {
    prompt: 'Unstoppable Hulk: możesz KO Wound z ręki lub stosu odrzuconych',
    optional: true,
  })
  if (!chosen) return

  koCard(state, chosen.instanceId)
  state.attack += 2
})

registerCardAbility('hero-hulk-crazed-rampage', async (state, { ui }) => {
  await gainWound(state, ui)
})

registerCardAbility('hero-hulk-hulk-smash', async (state) => {
  if (countPlayedThisTurn(state, { type: 'strength' }) > 0) {
    state.attack += 5
  }
})

// ---------- Iron Man ----------

registerCardAbility('hero-iron-man-endless-invention', async (state) => {
  drawCards(state, 1)
  if (countPlayedThisTurn(state, { type: 'tech' }) > 0) {
    drawCards(state, 1)
  }
})

registerCardAbility('hero-iron-man-repulsor-rays', async (state) => {
  if (countPlayedThisTurn(state, { type: 'ranged' }) > 0) {
    state.attack += 1
  }
})

registerCardAbility('hero-iron-man-arc-reactor', async (state, { self }) => {
  if (countPlayedThisTurn(state, { type: 'tech' }) === 0) return
  const ownHero = state.cards[self.cardId].hero
  state.attack += countDistinctHeroesPlayedThisTurn(state, {}, self.instanceId, ownHero)
})

registerCardAbility('hero-iron-man-quantum-breakthrough', async (state) => {
  drawCards(state, 2)
  if (countPlayedThisTurn(state, { type: 'tech' }) > 0) {
    drawCards(state, 2)
  }
})