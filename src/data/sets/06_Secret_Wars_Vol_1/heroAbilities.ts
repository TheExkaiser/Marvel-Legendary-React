import { registerCardAbility } from '../../../engine/cardAbilities'
import { chooseOneCard, revealOneOr } from '../../../engine/abilityHelpers'
import { getCardData } from '../../../engine/cardData'
import { drawCards, drawRevealed, putCardsOnTop, revealTopAndDrawIf } from '../../../engine/deckOps'
import { revealCards, koCard, discardCard, revealTopCards, isVillainCard, countPlayedThisTurn, matchesRampageCharacter, mostRecentHeroPlayed, getEffectiveStrength, countBystandersInPile, isShieldHero, koFromVictoryPile } from '../../../engine/keywords'
import { addAttack, addRecruit } from '../../../engine/resources'
import { gainSidekicks } from '../../../engine/sidekicks'
import { claimTacticFree, defeatVillainFree, defeatVillainFromDeck, registerFightEffectCancellation, registerLocationDefeatHook, registerVillainDefeatHook } from '../../../engine/combat'
import { refillHq } from '../../../engine/recruit'
import { returnShardsOn } from '../../../engine/shards'
import { teleportCard } from '../../../engine/turn'
import { enterCity, resolveVillainDeckCard } from '../../../engine/villainPhase'
import { gainWound, rescueCard } from '../../../engine/wounds'
import type { CardInstance, GameState } from '../../../engine/types'

function hasNoRulesText(state: GameState, instance: CardInstance): boolean {
  const card = getCardData(state, instance)
  return !card.text?.trim() && !card.conditionText?.trim()
}

function hasPlayedEachType(state: GameState, types: string[]): boolean {
  return types.every((type) =>
    countPlayedThisTurn(state, { type }) > 0,
  )
}

registerCardAbility('secret-wars-apocalyptic-kitty-pryde-phase-out', async (state, { ui }) => {
  const chosen = await ui.choose([...state.hand, ...state.discard], {
    prompt: 'Phase Out: KO a card from your hand or discard pile to get +1 Attack?',
    optional: true,
  })
  if (!chosen) return
  koCard(state, chosen.instanceId)
  addAttack(state, 1)
})

registerCardAbility('secret-wars-apocalyptic-kitty-pryde-infiltrate-hq', async (state, { ui }) => {
  const heroes = state.hq.flatMap((card) => card && state.cards[card.cardId].hero ? [card] : [])
  const chosen = await chooseOneCard(ui, heroes, 'Infiltrate HQ: put a Hero from the HQ on the bottom of the Hero Deck?')
  if (!chosen) return

  const index = state.hq.findIndex((card) => card?.instanceId === chosen.instanceId)
  if (index < 0) return
  state.hq[index] = null
  returnShardsOn(state, chosen)
  state.heroDeck.unshift(chosen)
  refillHq(state)

  const replacement = state.hq[index]
  if (replacement && state.cards[replacement.cardId].hero) {
    state.hqCardCostReductions = {
      ...state.hqCardCostReductions,
      [replacement.instanceId]: (state.hqCardCostReductions?.[replacement.instanceId] ?? 0) + 1,
    }
  }
})

registerCardAbility('secret-wars-apocalyptic-kitty-pryde-disrupt-circuits', async (state) => {
  const techHeroes = state.hq.filter((card) => {
    if (!card) return false
    const data = state.cards[card.cardId]
    return !!data.hero && (data.type ?? []).includes('tech')
  }).length
  addAttack(state, techHeroes)
})

registerFightEffectCancellation('secret-wars-apocalyptic-kitty-pryde-untouchable', async (state, ui, enemy) => {
  const untouchable = state.played.find(
    (card) => card.cardId === 'secret-wars-apocalyptic-kitty-pryde-untouchable',
  )
  if (!untouchable) return false
  const chosen = await ui.choose([untouchable], {
    prompt: `Untouchable: discard this card to cancel ${state.cards[enemy.cardId].name}'s Fight effect and draw three cards?`,
    optional: true,
  })
  if (!chosen) return false
  await discardCard(state, chosen.instanceId, ui)
  drawCards(state, 3)
  return true
})

registerCardAbility('secret-wars-black-bolt-destructive-whisper', async (state) => {
  if (revealCards(state).filter((card) => hasNoRulesText(state, card)).length >= 4) {
    addAttack(state, 1)
  }
})

registerCardAbility('secret-wars-black-bolt-silence-is-golden', async (state, { ui }) => {
  const cards = state.cardsPlayedThisTurn.filter((card) => hasNoRulesText(state, card))
  if (cards.length === 0) return
  const chosen = await ui.choose(cards, {
    prompt: 'Silence is Golden: choose a card you played this turn with no rules text.',
    optional: false,
  })
  if (!chosen) return
  const data = state.cards[chosen.cardId]
  addRecruit(state, data.recruit ?? 0)
  addAttack(state, data.attack ?? 0)
})

registerCardAbility('secret-wars-black-bolt-hypersonic-scream', async (state) => {
  const count = state.cardsPlayedThisTurn.filter((card) => hasNoRulesText(state, card)).length
  drawCards(state, count)
})

registerCardAbility('secret-wars-black-panther-catlike-reflexes', async (state) => {
  drawCards(state, 1)
})

registerCardAbility('secret-wars-black-panther-multifaceted-genius', async (state) => {
  const count = state.cardsPlayedThisTurn.filter((card) => (state.cards[card.cardId].type ?? []).length > 1).length
  addAttack(state, count)
})

registerLocationDefeatHook('secret-wars-black-panther-stalk-the-urban-jungle', async (state, ui, location) => {
  if (location !== 'Rooftops' && location !== 'Streets') return
  const cards = [...state.hand, ...state.discard]
  const chosen = await ui.choose(cards, {
    prompt: 'Stalk the Urban Jungle: KO one of your cards or a card from your discard pile?',
    optional: true,
  })
  if (chosen) koCard(state, chosen.instanceId)
})

registerCardAbility('secret-wars-black-panther-king-of-wakanda', async (state) => {
  gainSidekicks(state, 3, 'deck-top')
})

registerCardAbility('secret-wars-captain-marvel-absorb-energies', async (state) => {
  const rangedHeroes = state.cardsPlayedThisTurn.filter((card) => {
    const data = state.cards[card.cardId]
    return !!data.hero && (data.type ?? []).includes('ranged')
  }).length
  addRecruit(state, rangedHeroes)
})

registerCardAbility('secret-wars-captain-marvel-supersonic-flight', async (state) => {
  drawCards(state, 1)
})

registerCardAbility('secret-wars-captain-marvel-marvelous-strength', async (state) => {
  const strengthHeroes = state.cardsPlayedThisTurn.filter((card) => {
    const data = state.cards[card.cardId]
    return !!data.hero && (data.type ?? []).includes('strength')
  }).length
  addAttack(state, strengthHeroes)
})

registerCardAbility('secret-wars-captain-marvel-cosmic-energies', async (state) => {
  const ranged = state.cardsPlayedThisTurn.filter((card) => (state.cards[card.cardId].type ?? []).includes('ranged')).length
  const strength = state.cardsPlayedThisTurn.filter((card) => (state.cards[card.cardId].type ?? []).includes('strength')).length
  if (ranged >= 2 && strength >= 2) addAttack(state, 6)
})

registerCardAbility('secret-wars-sidekick', async (state, { self, ui }) => {
  const chosen = await ui.choose([self], {
    prompt: 'Sidekick: return this card to the Sidekick Stack to draw two cards?',
    optional: true,
  })
  if (!chosen) return
  const index = state.played.findIndex((card) => card.instanceId === chosen.instanceId)
  if (index < 0) return
  const [sidekick] = state.played.splice(index, 1)
  state.sidekickStack.push(sidekick)
  drawCards(state, 2)
})

function useOncePerTurnAbility(state: GameState, cardId: string): boolean {
  const used = state.oncePerTurnAbilitiesUsed ?? []
  if (used.includes(cardId)) return false
  state.oncePerTurnAbilitiesUsed = [...used, cardId]
  return true
}

registerCardAbility('secret-wars-dr-strange-cloak-of-levitation', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'ranged' }) === 0) return
  const [revealed] = await revealTopCards(state, ui, 1, 'Cloak of Levitation')
  if (!revealed) return
  const choice = await ui.chooseOption(
    [{ id: 'draw', label: 'Draw it' }, { id: 'teleport', label: 'Teleport it' }],
    'Cloak of Levitation: draw or Teleport the revealed card?',
  )
  if (choice === 'draw') {
    drawRevealed(state, [revealed])
  } else if (choice === 'teleport') {
    state.hand.push(revealed)
    await teleportCard(state, revealed.instanceId, ui, true)
  } else {
    putCardsOnTop(state, [revealed])
  }
})

registerCardAbility('secret-wars-dr-strange-trust-me-im-a-doctor', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { team: 'illuminati' }) === 0) return
  const options = [...state.hand, ...state.discard]
  if (options.length === 0) return
  const chosen = await ui.choose(options, {
    prompt: "Trust Me, I'm a Doctor: KO a card from your hand or discard pile for +1 Recruit?",
    optional: true,
  })
  if (!chosen) return
  koCard(state, chosen.instanceId)
  addRecruit(state, 1)
})

registerCardAbility('secret-wars-dr-strange-fight-the-future', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'instinct' }) === 0) return
  const villain = state.villainDeck[state.villainDeck.length - 1]
  if (!villain) return
  const data = state.cards[villain.cardId]
  await ui.showInfo(villain, 'Fight the Future: revealed the top card of the Villain Deck')
  if (!isVillainCard(data)) return

  addAttack(state, 2)
  const chosen = await ui.choose([villain], {
    prompt: `Fight the Future: fight ${data.name} this turn?`,
    optional: true,
  })
  if (chosen && !(await defeatVillainFromDeck(state, ui, true))) {
    await ui.showInfo(villain, 'Fight the Future: not enough Attack to defeat this Villain')
  }
})

registerCardAbility('secret-wars-dr-strange-sorcerer-supreme', async (state, { ui }) => {
  const cards = await revealTopCards(state, ui, 3, 'Sorcerer Supreme')
  const remaining = [...cards]
  const drawn: CardInstance[] = []
  while (remaining.length > 0) {
    const chosen = await ui.choose(remaining, {
      prompt: 'Sorcerer Supreme: choose a card to draw, or stop to Teleport the rest.',
      optional: true,
    })
    if (!chosen) break
    drawn.push(chosen)
    const index = remaining.findIndex((card) => card.instanceId === chosen.instanceId)
    if (index >= 0) remaining.splice(index, 1)
  }
  drawRevealed(state, drawn)
  for (const card of remaining) {
    state.hand.push(card)
    await teleportCard(state, card.instanceId, ui, true)
  }
})

registerCardAbility('secret-wars-lady-thor-mysterious-origin', async (state) => {
  if (state.recruitGainedThisTurn >= 6 && useOncePerTurnAbility(state, 'secret-wars-lady-thor-mysterious-origin')) {
    drawCards(state, 1)
  }
})

registerCardAbility('secret-wars-lady-thor-chosen-by-asgard', async (state) => {
  if (state.recruitGainedThisTurn >= 6 && useOncePerTurnAbility(state, 'secret-wars-lady-thor-chosen-by-asgard')) {
    addAttack(state, 2)
  }
})

registerCardAbility('secret-wars-lady-thor-living-thunderstorm', async (state) => {
  if (state.recruitGainedThisTurn >= 6 && useOncePerTurnAbility(state, 'secret-wars-lady-thor-living-thunderstorm')) {
    addAttack(state, 6)
  }
})

registerCardAbility('secret-wars-lady-thor-heir-to-the-hammer', async (state) => {
  if (hasPlayedEachType(state, ['ranged', 'strength'])) addAttack(state, 2)
})

registerCardAbility('secret-wars-magik-rally-the-new-mutants', async (state) => {
  gainSidekicks(state, 1 + Number(countPlayedThisTurn(state, { type: 'covert' }) > 0))
})

registerCardAbility('secret-wars-magik-travel-through-limbo', async (state) => {
  if (countPlayedThisTurn(state, { type: 'ranged' }) > 0) addAttack(state, 2)
})

registerCardAbility('secret-wars-magik-dimensional-portal', async (state) => {
  addAttack(state, state.cardsPlayedThisTurn.filter((card) => card.cardId === 'secret-wars-sidekick').length)
})

registerCardAbility('secret-wars-magik-wield-the-soulsword', async (state, { ui }) => {
  const targets = state.defeated.filter((card) => {
    const data = state.cards[card.cardId]
    return isVillainCard(data) || data.text?.startsWith('Fight:')
  })
  const chosen = await chooseOneCard(ui, targets, 'Wield the Soulsword: choose a Villain or Mastermind in your Victory Pile.')
  if (chosen) addAttack(state, state.cards[chosen.cardId].vp ?? 0)
})

registerCardAbility('secret-wars-maximus-mental-domination', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'covert' }) === 0) return
  const targets = state.city.filter(
    (card): card is CardInstance => !!card && state.cards[card.cardId].henchman === true,
  )
  const chosen = await chooseOneCard(ui, targets, 'Mental Domination: defeat a Henchman Villain for free.')
  if (chosen) await defeatVillainFree(state, chosen.instanceId, ui)
})

registerCardAbility('secret-wars-maximus-enslave-the-will', async (state, { self }) => {
  if (countPlayedThisTurn(state, { type: 'tech' }) > 0) {
    state.activeVillainDefeatHooks = [...(state.activeVillainDefeatHooks ?? []), self.instanceId]
  }
})

registerVillainDefeatHook('secret-wars-maximus-enslave-the-will', async (state) => {
  gainSidekicks(state, 1)
})

registerCardAbility('secret-wars-maximus-pieces-on-a-chessboard', async (state, { ui }) => {
  const henchmen = state.defeated.filter((card) => state.cards[card.cardId].henchman === true)
  const chosen = await ui.choose(henchmen, {
    prompt: 'Pieces on a Chessboard: have a Henchman Villain from your Victory Pile enter the city?',
    optional: true,
  })
  if (!chosen) return
  const index = state.defeated.findIndex((card) => card.instanceId === chosen.instanceId)
  if (index < 0) return
  const [henchman] = state.defeated.splice(index, 1)
  await enterCity(state, henchman, ui)
  drawCards(state, 1)
})

registerCardAbility('secret-wars-maximus-inhuman-mastery', async (state, { ui }) => {
  const techHeroes = revealCards(state, { type: 'tech' }).filter(
    (card) => !!state.cards[card.cardId].hero,
  )
  await revealOneOr(
    ui,
    techHeroes,
    'Inhuman Mastery: reveal a Tech Hero.',
    'Inhuman Mastery: revealed a Tech Hero',
    async () => {
      const henchmen = state.defeated.filter((card) => state.cards[card.cardId].henchman === true)
      const chosen = await chooseOneCard(
        ui,
        henchmen,
        'Inhuman Mastery: choose a Henchman Villain from your Victory Pile.',
      )
      if (!chosen) return
      const index = state.defeated.findIndex((card) => card.instanceId === chosen.instanceId)
      if (index < 0) return
      const [henchman] = state.defeated.splice(index, 1)
      await resolveVillainDeckCard(state, henchman, ui)
      if (state.city.some((card) => card?.instanceId === henchman.instanceId)) {
        await defeatVillainFree(state, henchman.instanceId, ui)
      }
    },
  )
  if (countPlayedThisTurn(state, { team: 'cabal' }) > 0) {
    addAttack(state, state.henchmenDefeatedThisTurn ?? 0)
  }
})

registerCardAbility('secret-wars-namor-lead-the-armies-of-atlantis', async (state) => {
  if (countPlayedThisTurn(state, { type: 'instinct' }) > 0) gainSidekicks(state, 1)
})

registerCardAbility('secret-wars-namor-ruler-of-the-seas', async (state) => {
  if (countPlayedThisTurn(state, { type: 'strength' }) === 0) return
  state.locationAttackModifiers.Bridge = (state.locationAttackModifiers.Bridge ?? 0) - 2
  state.mastermindAttackModifierThisTurn -= 2
})

registerCardAbility('secret-wars-namor-feed-the-sharks', async (state, { ui }) => {
  const options = [...state.hand, ...state.discard]
  if (options.length === 0) return
  const chosen = await ui.choose(options, {
    prompt: 'Feed the Sharks: KO a card from your hand or discard pile to draw a card?',
    optional: true,
  })
  if (!chosen) return
  koCard(state, chosen.instanceId)
  drawCards(state, 1)
})

registerCardAbility('secret-wars-namor-imperius-rex', async (state, { ui }) => {
  const canFightMastermind =
    countPlayedThisTurn(state, { type: 'instinct' }) >= 2 &&
    countPlayedThisTurn(state, { type: 'strength' }) >= 2
  const villains = state.city.filter((card): card is CardInstance => !!card && isVillainCard(state.cards[card.cardId]))
  if (canFightMastermind && villains.length > 0) {
    const choice = await ui.chooseOption(
      [{ id: 'villain', label: 'Defeat a Villain for free' }, { id: 'mastermind', label: 'Defeat the Mastermind once for free' }],
      'Imperius Rex: choose which enemy to defeat for free.',
    )
    if (choice === 'mastermind') {
      await claimTacticFree(state, ui)
      return
    }
    if (choice !== 'villain') return
  } else if (canFightMastermind && villains.length === 0) {
    await claimTacticFree(state, ui)
    return
  }
  const chosen = await chooseOneCard(ui, villains, 'Imperius Rex: defeat a Villain for free.')
  if (chosen) await defeatVillainFree(state, chosen.instanceId, ui)
})

registerCardAbility('secret-wars-old-man-logan-last-survivor', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'instinct' }) === 0) return
  const options = [...state.hand, ...state.discard]
  if (options.length === 0) return
  const chosen = await ui.choose(options, {
    prompt: 'Last Survivor: KO a card from your hand or discard pile?',
    optional: true,
  })
  if (!chosen) return
  const isWound = state.cards[chosen.cardId].kind === 'wound'
  koCard(state, chosen.instanceId)
  if (isWound) drawCards(state, 1)
})

registerCardAbility('secret-wars-old-man-logan-loner', async (state) => {
  if ((state.heroesRecruitedThisTurn ?? 0) === 0) addAttack(state, 2)
})

registerCardAbility('secret-wars-old-man-logan-rage-out', async (state, { self, ui }) => {
  if (countPlayedThisTurn(state, { type: 'instinct' }) === 0) return
  const wolverine = [...revealCards(state), ...state.defeated].find((card) =>
    card.instanceId !== self.instanceId && matchesRampageCharacter(state, card, 'Wolverine'),
  )
  await revealOneOr(
    ui,
    wolverine ? [wolverine] : [],
    'Cross-Dimensional Wolverine Rampage: reveal a Wolverine card.',
    'Cross-Dimensional Wolverine Rampage: revealed a Wolverine card',
    async () => {
      const wound = state.wounds[state.wounds.length - 1]
      await gainWound(state, ui)
      const gainedWound = wound && [...state.deck, ...state.hand, ...state.played, ...state.discard]
        .some((card) => card.instanceId === wound.instanceId)
      if (gainedWound) addAttack(state, 1)
    },
  )
})

registerCardAbility('secret-wars-old-man-logan-no-more-heroes', async (state, { ui }) => {
  await ui.showCards(state.hand, 'No More Heroes: revealed your hand')
  const isShieldOrHydra = (card: CardInstance) => {
    const data = state.cards[card.cardId]
    return (
      isShieldHero(data) ||
      (data.team ?? []).some((team) => team.toLowerCase() === 'hydra') ||
      /\bHYDRA\b/i.test(data.name)
    )
  }
  if (state.cardsPlayedThisTurn.some(isShieldOrHydra) || state.hand.some(isShieldOrHydra)) return
  addAttack(state, 5)
})

registerCardAbility('secret-wars-proxima-midnight-master-combatant', async (state) => {
  const latestHero = mostRecentHeroPlayed(state)
  if (!latestHero) return
  const data = state.cards[latestHero.cardId]
  if (data.recruit !== undefined) addRecruit(state, 2)
  if (data.attack !== undefined) addAttack(state, 2)
})

registerCardAbility('secret-wars-proxima-midnight-general-of-the-black-order', async (state) => {
  if (countPlayedThisTurn(state, { type: 'instinct' }) > 0) addRecruit(state, 3)
})

registerCardAbility('secret-wars-proxima-midnight-supernova-spear', async (state) => {
  if (countPlayedThisTurn(state, { type: 'covert' }) > 0) {
    addRecruit(state, 4)
    addAttack(state, 4)
  }
})

registerCardAbility('secret-wars-superior-iron-man-armor-upgrades', async (state) => {
  if (countPlayedThisTurn(state, { type: 'tech' }) > 0) addAttack(state, 2)
})

registerCardAbility('secret-wars-superior-iron-man-optimized-technology', async (state) => {
  drawCards(state, 1)
})

registerCardAbility('secret-wars-superior-iron-man-superior-to-others', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'ranged' }) === 0) return
  const cards = takeTopCards(state, 2)
  if (cards.length === 0) return
  await ui.showCards(cards, 'Superior to Others: look at the top two cards of your deck')
  if (cards.length === 1) {
    putCardsOnTop(state, cards)
    return
  }
  const firstCost = state.cards[cards[0].cardId].cost ?? 0
  const secondCost = state.cards[cards[1].cardId].cost ?? 0
  if (firstCost > secondCost) {
    drawRevealed(state, [cards[0]])
    putCardsOnTop(state, [cards[1]])
  } else if (secondCost > firstCost) {
    drawRevealed(state, [cards[1]])
    putCardsOnTop(state, [cards[0]])
  } else {
    const chosen = await ui.choose(cards, {
      prompt: 'Superior to Others: put one card on top of your deck first.',
      optional: false,
    })
    putCardsOnTop(state, chosen ? [chosen, ...cards.filter((card) => card.instanceId !== chosen.instanceId)] : cards)
  }
})

registerCardAbility('secret-wars-superior-iron-man-humblebrag', async () => {
  // There are no additional player Victory Piles in the current single-player game.
})

registerCardAbility('secret-wars-thanos-revel-in-destruction', async (state) => {
  if (countPlayedThisTurn(state, { team: 'cabal' }) === 0) return
  const bystander = state.bystanders.pop()
  if (!bystander) return
  state.ko.push(bystander)
  addRecruit(state, Math.floor(countBystandersInPile(state, state.ko) / 3))
})

registerCardAbility('secret-wars-thanos-transdimensional-overlord', async (state, { ui }) => {
  const bystanders = state.defeated.filter((card) => state.cards[card.cardId].kind === 'bystander')
  const chosen = await ui.choose(bystanders, {
    prompt: 'Transdimensional Overlord: KO a Bystander from your Victory Pile for +2 Attack?',
    optional: true,
  })
  if (!chosen) return
  koFromVictoryPile(state, chosen.instanceId)
  addAttack(state, 2)
})

registerCardAbility('secret-wars-thanos-galactic-domination', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'ranged' }) === 0) return
  const rangedHeroes = revealCards(state, { type: 'ranged' }).filter(
    (card) => !!state.cards[card.cardId].hero,
  )
  await revealOneOr(
    ui,
    rangedHeroes,
    'Galactic Domination: reveal a Ranged Hero.',
    'Galactic Domination: revealed a Ranged Hero',
    async () => {
      const bystanders = state.defeated.filter((card) => state.cards[card.cardId].kind === 'bystander')
      const chosen = await chooseOneCard(
        ui,
        bystanders,
        'Galactic Domination: choose a Bystander from your Victory Pile.',
      )
      if (!chosen) return
      const index = state.defeated.findIndex((card) => card.instanceId === chosen.instanceId)
      if (index < 0) return
      const [bystander] = state.defeated.splice(index, 1)
      await rescueCard(state, bystander, ui)
    },
  )
})

registerCardAbility('secret-wars-thanos-utter-annihilation', async (state, { ui }) => {
  for (let i = 0; i < 6; i++) {
    const bystander = state.bystanders.pop()
    if (!bystander) break
    state.ko.push(bystander)
  }
  const bystanderCount = countBystandersInPile(state, state.ko)
  const villains = state.city.filter(
    (card): card is CardInstance =>
      !!card &&
      isVillainCard(state.cards[card.cardId]) &&
      (getEffectiveStrength(state, card) ?? 0) < bystanderCount,
  )
  const mastermindCanBeDefeated = (getEffectiveStrength(state, state.mastermind) ?? 0) < bystanderCount
  const targets = [...villains, ...(mastermindCanBeDefeated ? [state.mastermind] : [])]
  const chosen = await chooseOneCard(ui, targets, 'Utter Annihilation: defeat an eligible Villain or Mastermind for free.')
  if (!chosen) return
  if (chosen.instanceId === state.mastermind.instanceId) await claimTacticFree(state, ui)
  else await defeatVillainFree(state, chosen.instanceId, ui)
})

registerCardAbility('secret-wars-ultimate-spider-man-marvel-team-up', async (state, { ui }) => {
  gainSidekicks(state, 1)
  await revealTopAndDrawIf(
    state,
    ui,
    (card) => (state.cards[card.cardId].cost ?? 0) <= 2,
    'Marvel Team-Up: revealed the top card of your deck',
  )
})

registerCardAbility('secret-wars-ultimate-spider-man-leaping-spider', async (state, { ui }) => {
  await revealTopAndDrawIf(
    state,
    ui,
    (card) => (state.cards[card.cardId].cost ?? 0) <= 2,
    'Leaping Spider: revealed the top card of your deck',
  )
  if (countPlayedThisTurn(state, { type: 'strength' }) > 0) addAttack(state, 2)
})

registerCardAbility('secret-wars-ultimate-spider-man-web-slinger', async (state, { ui }) => {
  state.locationAttackModifiers.Rooftops = (state.locationAttackModifiers.Rooftops ?? 0) - 2
  state.locationAttackModifiers.Bridge = (state.locationAttackModifiers.Bridge ?? 0) - 2
  state.mastermindAttackModifierThisTurn -= 2
  await revealTopAndDrawIf(
    state,
    ui,
    (card) => (state.cards[card.cardId].cost ?? 0) <= 2,
    'Web-Slinger: revealed the top card of your deck',
  )
})

registerCardAbility('secret-wars-ultimate-spider-man-hero-from-another-dimension', async (state) => {
  const count = state.cardsPlayedThisTurn.filter((card) => {
    const cost = state.cards[card.cardId].cost ?? 0
    return cost === 1 || cost === 2
  }).length
  addAttack(state, count * 2)
})
