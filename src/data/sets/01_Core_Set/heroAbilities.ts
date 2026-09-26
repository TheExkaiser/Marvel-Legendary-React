import { registerCardAbility, getCardAbility } from '../../../engine/cardAbilities'
import { drawCards, rescueBystander, gainWound, defeatVillainFree, claimTacticFree, takeTopCards, peekTopCard } from '../../../engine/game'
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
  isShieldHero,
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
  state.attack += countDistinctTypes(state, haveZone(state))
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

// ---------- Gambit ----------

registerCardAbility('hero-gambit-card-shark', async (state, { ui }) => {
  const top = peekTopCard(state)
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
    const top = peekTopCard(state)
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
  }

  await resolveOne()
  if (countPlayedThisTurn(state, { type: 'instinct' }) > 0) {
    await resolveOne()
  }
})

registerCardAbility('hero-gambit-high-stakes-jackpot', async (state, { ui }) => {
  const top = peekTopCard(state)
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

registerCardAbility('hero-iron-man-arc-reactor', async (state) => {
  if (countPlayedThisTurn(state, { type: 'tech' }) === 0) return
  // "Hero" = karta z ustawionym `type` (odróżnia to od Agenta/Trooper/Oficera, którzy `type` nie mają)
  const otherHeroesPlayed = state.cardsPlayedThisTurn.filter(
    (c) => !!state.cards[c.cardId].type,
  ).length
  state.attack += otherHeroesPlayed
})

registerCardAbility('hero-iron-man-quantum-breakthrough', async (state) => {
  drawCards(state, 2)
  if (countPlayedThisTurn(state, { type: 'tech' }) > 0) {
    drawCards(state, 2)
  }
})

// ---------- Nick Fury ----------

registerCardAbility('hero-nick-fury-battlefield-promotion', async (state, { ui, self }) => {
  const targets = haveZone(state).filter((c) => isShieldHero(state.cards[c.cardId]))
  if (targets.length === 0) return
  const chosen = await ui.choose(targets, {
    prompt: 'Battlefield Promotion: możesz KO S.H.I.E.L.D. Hero z ręki lub stosu odrzuconych',
    optional: true,
  })
  if (!chosen) return
  koCard(state, chosen.instanceId)

  if (state.officerDeck.length === 0) return
  const gain = await ui.choose([self], {
    prompt: 'Battlefield Promotion: chcesz zyskać S.H.I.E.L.D. Officera do ręki?',
    optional: true,
  })
  if (!gain) return
  const officer = state.officerDeck.pop()
  if (officer) state.hand.push(officer)
})

registerCardAbility('hero-nick-fury-high-tech-weaponry', async (state) => {
  if (countPlayedThisTurn(state, { type: 'tech' }) > 0) {
    state.attack += 1
  }
})

registerCardAbility('hero-nick-fury-legendary-commander', async (state) => {
  const count = state.cardsPlayedThisTurn.filter((c) => isShieldHero(state.cards[c.cardId])).length
  state.attack += count
})

registerCardAbility('hero-nick-fury-pure-fury', async (state, { ui, self }) => {
  const shieldHeroesInKo = state.ko.filter((c) => isShieldHero(state.cards[c.cardId])).length

  const villainTargets = state.city.filter(
    (c): c is CardInstance =>
      !!c && (state.cards[c.cardId].strength ?? 0) < shieldHeroesInKo,
  )
  const mastermindEligible =
    (state.cards[state.mastermind.cardId].strength ?? 0) < shieldHeroesInKo
  const targets = [...villainTargets, ...(mastermindEligible ? [state.mastermind] : [])]

  if (targets.length === 0) {
    await ui.showInfo(
      self,
      `Pure Fury: no eligible target (S.H.I.E.L.D. Heroes in KO: ${shieldHeroesInKo})`,
    )
    return
  }

  const chosen =
    targets.length === 1
      ? targets[0]
      : await ui.choose(targets, { prompt: 'Pure Fury: choose a target to defeat', optional: false })
  if (!chosen) return

  if (chosen.instanceId === state.mastermind.instanceId) {
    await claimTacticFree(state, ui)
  } else {
    defeatVillainFree(state, chosen.instanceId)
  }
})

// ---------- Rogue ----------

registerCardAbility('hero-rogue-borrowed-brawn', async (state) => {
  if (countPlayedThisTurn(state, { type: 'strength' }) > 0) {
    state.attack += 3
  }
})

registerCardAbility('hero-rogue-energy-drain', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'covert' }) === 0) return

  const options = [...state.hand, ...state.discard]
  if (options.length === 0) return

  const chosen = await ui.choose(options, {
    prompt: 'Energy Drain: możesz KO kartę z ręki lub stosu odrzuconych',
    optional: true,
  })
  if (!chosen) return

  koCard(state, chosen.instanceId)
  state.recruit += 1
})

registerCardAbility('hero-rogue-copy-powers', async (state, { ui, self }) => {
  const targets = state.cardsPlayedThisTurn
  if (targets.length === 0) return

  const chosen = await ui.choose(targets, {
    prompt: 'Copy Powers: wybierz kartę zagraną w tej turze do skopiowania',
    optional: false,
  })
  if (!chosen) return

  const copiedData = state.cards[chosen.cardId]
  state.attack += copiedData.attack ?? 0
  state.recruit += copiedData.recruit ?? 0

  state.copiedCardIds = state.copiedCardIds ?? {}
  state.copiedCardIds[self.instanceId] = chosen.cardId

  const ability = getCardAbility(chosen.cardId)
  if (ability) {
    await ability(state, { self, ui })
  }
})

registerCardAbility('hero-rogue-steal-abilities', async (state, { ui, self }) => {
  const [top] = takeTopCards(state, 1)
  if (!top) return
  state.discard.push(top)
  await ui.showInfo(top, 'Steal Abilities: odkryto i odrzucono wierzchnią kartę talii')

  const data = state.cards[top.cardId]
  state.attack += data.attack ?? 0
  state.recruit += data.recruit ?? 0

  const ability = getCardAbility(top.cardId)
  if (ability) {
    await ability(state, { self, ui })
  }
})

// ---------- Spider-Man ----------

async function revealAndDrawIfCheap(state: GameState, ui: UiAdapter, label: string): Promise<void> {
  const top = peekTopCard(state)
  if (!top) return
  await ui.showInfo(top, `${label}: odkryto wierzchnią kartę talii`)
  if ((state.cards[top.cardId].cost ?? 0) <= 2) {
    state.deck.pop()
    state.hand.push(top)
  }
}

registerCardAbility('hero-spider-man-astonishing-strength', async (state, { ui }) => {
  await revealAndDrawIfCheap(state, ui, 'Astonishing Strength')
})

registerCardAbility('hero-spider-man-great-responsibility', async (state, { ui }) => {
  await revealAndDrawIfCheap(state, ui, 'Great Responsibility')
})

registerCardAbility('hero-spider-man-web-shooters', async (state, { ui }) => {
  rescueBystander(state)
  await revealAndDrawIfCheap(state, ui, 'Web-Shooters')
})

registerCardAbility('hero-spider-man-the-amazing-spider-man', async (state, { ui }) => {
  const revealed = takeTopCards(state, 3)
  if (revealed.length === 0) return

  for (const card of revealed) {
    await ui.showInfo(card, 'The Amazing Spider-Man: odkryto kartę z talii')
  }

  const putBack: CardInstance[] = []
  for (const card of revealed) {
    if ((state.cards[card.cardId].cost ?? 0) <= 2) {
      state.hand.push(card)
    } else {
      putBack.push(card)
    }
  }

  for (let i = putBack.length - 1; i >= 0; i--) {
    state.deck.push(putBack[i])
  }
})