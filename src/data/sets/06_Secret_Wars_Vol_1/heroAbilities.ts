import { registerCardAbility } from '../../../engine/cardAbilities'
import { chooseOneCard } from '../../../engine/abilityHelpers'
import { getCardData } from '../../../engine/cardData'
import { drawCards, drawRevealed, putCardsOnTop } from '../../../engine/deckOps'
import { revealCards, koCard, discardCard, revealTopCards, isVillainCard, countPlayedThisTurn } from '../../../engine/keywords'
import { addAttack, addRecruit } from '../../../engine/resources'
import { gainSidekicks } from '../../../engine/sidekicks'
import { defeatVillainFromDeck, registerFightEffectCancellation, registerLocationDefeatHook } from '../../../engine/combat'
import { refillHq } from '../../../engine/recruit'
import { returnShardsOn } from '../../../engine/shards'
import { teleportCard } from '../../../engine/turn'
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
