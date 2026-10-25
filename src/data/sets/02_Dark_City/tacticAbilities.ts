import { registerCardAbility } from '../../../engine/cardAbilities'
import { takeTopCards } from '../../../engine/game'
import { koCard, isVillainCard, koFromVictoryPile, revealCards, revealTopCards } from '../../../engine/keywords'
import { resolveVillainDeckCard, resolveMasterStrike } from '../../../engine/villainPhase'
import type { CardInstance, GameState } from '../../../engine/types'
import { rescueBystander, gainWound } from '../../../engine/game'
import { shuffle } from '../../../engine/random'
import { captureFromSupply, captureForSinister, SINISTER_TACTIC_IDS } from './sinisterCaptives'
import type { UiAdapter } from '../../../engine/ui'

/** Zdejmuje `count` kart z wierzchu talii złoczyńców i pokazuje każdą z osobna (od wierzchu). */
async function revealFromVillainDeck(
  state: GameState,
  ui: UiAdapter,
  count: number,
  label: string,
): Promise<CardInstance[]> {
  const revealed: CardInstance[] = []
  for (let i = 0; i < count; i++) {
    const card = state.villainDeck.pop()
    if (card) revealed.push(card)
  }
  for (const card of revealed) {
    await ui.revealCard(card, `${label}: revealed ${state.cards[card.cardId].name}`)
    console.log(`revealed: ${state.cards[card.cardId].name}`)
  }
  return revealed
}

/** Sinister łapie karty i pokazuje każdą z osobna (jak w jego Master Strike). */
async function captureAndShowForSinister(state: GameState, ui: UiAdapter, cards: CardInstance[]): Promise<void> {
  captureForSinister(state, cards)
  for (const card of cards) {
    await ui.showCapture(state.mastermind, card, 'Bystander captured by Mr. Sinister')
  }
}

// ---------- Apocalypse ----------

registerCardAbility('apocalypse-apocalyptic-destruction', async (state, { ui }) => {
  for (let i = 0; i < 2; i++) {
    const heroes = state.discard.filter((c) => {
      const data = state.cards[c.cardId]
      return !!data.hero && (data.cost ?? 0) >= 1
    })
    if (heroes.length === 0) return

    const chosen = await ui.choose(heroes, {
      prompt: `Apocalyptic Destruction: KO a Hero that costs 1 or more from your discard pile (${i + 1}/2)`,
      optional: false,
    })
    if (!chosen) return
    koCard(state, chosen.instanceId)
  }
})

registerCardAbility('apocalypse-the-end-of-all-things', async (state, { ui }) => {
  const keep: CardInstance[] = []
  for (const card of await revealTopCards(state, ui, 3, 'The End of All Things')) {
    if ((state.cards[card.cardId].cost ?? 0) >= 1) state.ko.push(card)
    else keep.push(card)
  }

  const order: CardInstance[] = [] // od wierzchu
  while (keep.length > 1) {
    const chosen = await ui.choose(keep, {
      prompt: 'The End of All Things: choose the card to put on top of your deck',
      optional: false,
    })
    if (!chosen) break
    order.push(chosen)
    keep.splice(keep.findIndex((c) => c.instanceId === chosen.instanceId), 1)
  }
  order.push(...keep)

  for (let i = order.length - 1; i >= 0; i--) state.deck.push(order[i])
})

registerCardAbility('apocalypse-horsemen-are-drawing-nearer', async (state, { ui }) => {
  const group = state.ledVillainGroup
  const horsemen = state.defeated.filter((c) => group !== undefined && state.cards[c.cardId].villainGroup === group)
  if (horsemen.length === 0) return

  const chosen = await ui.choose(horsemen, {
    prompt: `Horsemen Are Drawing Nearer: play a ${group} Villain from your Victory Pile`,
    optional: false,
  })
  if (!chosen) return

  state.defeated.splice(state.defeated.findIndex((c) => c.instanceId === chosen.instanceId), 1)
  await resolveVillainDeckCard(state, chosen, ui)
})

// ---------- Kingpin ----------

registerCardAbility('kingpin-call-a-hit', async (state, { ui }) => {
  const heroes = state.discard.filter((c) => !!state.cards[c.cardId].hero)
  if (heroes.length === 0) return

  const chosen = await ui.choose(heroes, {
    prompt: 'Call a Hit: KO a Hero from your discard pile',
    optional: false,
  })
  if (chosen) koCard(state, chosen.instanceId)
})

registerCardAbility('kingpin-dirty-cops', async (state, { ui }) => {
  const heroes = state.ko.filter((c) => {
    const data = state.cards[c.cardId]
    return !!data.hero && (data.cost ?? 0) === 0
  })
  if (heroes.length === 0) return

  const chosen = await ui.choose(heroes, {
    prompt: 'Dirty Cops: put a 0 Cost Hero from the KO pile on top of your deck',
    optional: false,
  })
  if (!chosen) return

  state.ko.splice(state.ko.findIndex((c) => c.instanceId === chosen.instanceId), 1)
  state.deck.push(chosen)
})

registerCardAbility('kingpin-mob-war', async (state, { ui }) => {
  const henchmen = state.defeated.filter((c) => state.cards[c.cardId].henchman === true)
  if (henchmen.length === 0) return

  const chosen = await ui.choose(henchmen, {
    prompt: 'Mob War: play a Henchman Villain from your Victory Pile',
    optional: false,
  })
  if (!chosen) return

  state.defeated.splice(state.defeated.findIndex((c) => c.instanceId === chosen.instanceId), 1)
  await resolveVillainDeckCard(state, chosen, ui)
})

registerCardAbility('apocalypse-immortal-and-undefeated', async (state, { self, ui }) => {
  if (state.tactics.length === 0) return // to była ostatnia Taktyka

  for (let i = 0; i < 6; i++) rescueBystander(state, ui)
  state.tactics.push(self)
  state.tactics = shuffle(state.tactics)
})

registerCardAbility('kingpin-criminal-empire', async (state, { ui }) => {
  if (state.tactics.length === 0) return // to była ostatnia Taktyka

  const revealed = await revealFromVillainDeck(state, ui, 3, 'Criminal Empire')

  const villains = revealed.filter((c) => isVillainCard(state.cards[c.cardId]))
  const rest = revealed.filter((c) => !villains.includes(c))

  for (const villain of villains) await resolveVillainDeckCard(state, villain, ui)

  // dopiero po rozegraniu, żeby efekty "zagraj wierzchnią kartę" nie trafiały na odłożone karty
  state.villainDeck.push(...shuffle(rest))
})

// ---------- Mephisto ----------

registerCardAbility('mephisto-damned-if-you-do', async (state, { ui }) => {
  const bystanders = state.defeated.filter((c) => state.cards[c.cardId].kind === 'bystander')

  if (bystanders.length > 0) {
    const choice = await ui.chooseOption(
      [
        { id: 'ko', label: 'KO a Bystander from your Victory Pile' },
        { id: 'wound', label: 'Gain a Wound' },
      ],
      'Damned If You Do...: choose an effect',
    )
    if (choice === 'ko') {
      koFromVictoryPile(state, bystanders[0].instanceId) // Bystanderzy są identyczni
      return
    }
  }

  await gainWound(state, ui)
})

registerCardAbility('mephisto-devilish-torment', async (state, { ui }) => {
  const zeroCost = state.discard.filter((c) => {
    const data = state.cards[c.cardId]
    return data.hero !== undefined && (data.cost ?? 0) === 0
  })
  if (zeroCost.length === 0) return

  state.discard = state.discard.filter((c) => !zeroCost.includes(c))

  const left = [...zeroCost]
  const order: CardInstance[] = [] // od wierzchu
  // pytamy tylko, gdy zostały różne karty (identyczne można położyć w dowolnej kolejności)
  while (new Set(left.map((c) => c.cardId)).size > 1) {
    const chosen = await ui.choose(left, {
      prompt: 'Devilish Torment: choose the card to put on top of your deck',
      optional: false,
    })
    if (!chosen) break
    order.push(chosen)
    left.splice(left.findIndex((c) => c.instanceId === chosen.instanceId), 1)
  }
  order.push(...left)

  for (let i = order.length - 1; i >= 0; i--) state.deck.push(order[i])
})

registerCardAbility('mephisto-pain-begets-pain', async (state, { ui }) => {
  // Solo: nie ma gracza po prawej — wybrane Rany wracają do stosu Ran
  for (;;) {
    const wounds = [...state.hand, ...state.discard].filter((c) => state.cards[c.cardId].kind === 'wound')
    if (wounds.length === 0) return

    const chosen = await ui.choose(wounds, {
      prompt: 'Pain Begets Pain: choose a Wound to give away (skip to finish)',
      optional: true,
    })
    if (!chosen) return

    for (const pile of [state.hand, state.discard]) {
      const index = pile.findIndex((c) => c.instanceId === chosen.instanceId)
      if (index === -1) continue
      const [card] = pile.splice(index, 1)
      state.wounds.push(card)
      break
    }
  }
})

registerCardAbility('mephisto-the-price-of-failure', async (state, { ui }) => {
  // "Taktyka w Victory Pile" = karta bez bohatera, villaina, henchmana, rodzaju (bystander itd.) i siły
  const hasTactic = state.defeated.some((c) => {
    const data = state.cards[c.cardId]
    return (
      data.kind === undefined &&
      data.hero === undefined &&
      data.villainGroup === undefined &&
      !data.henchman &&
      data.strength === undefined
    )
  })
  if (!hasTactic) await gainWound(state, ui)
})

// ---------- Mr. Sinister ----------

registerCardAbility('sinister-human-experimentation', async (state, { ui }) => {
  const villains = state.city.filter((c) => c && isVillainCard(state.cards[c.cardId])).length
  await captureAndShowForSinister(state, ui, captureFromSupply(state, villains))
})

registerCardAbility('sinister-master-geneticist', async (state, { ui }) => {
  const revealed: CardInstance[] = []
  for (let i = 0; i < 7; i++) {
    const card = state.villainDeck.pop()
    if (card) revealed.push(card)
  }

  const bystanders = revealed.filter((c) => state.cards[c.cardId].kind === 'bystander')
  const rest = revealed.filter((c) => !bystanders.includes(c))

  // pokazujemy karty po kolei, od wierzchu: Bystanderzy jako przejęcie, reszta jako reveal
  for (const card of revealed) {
    if (state.cards[card.cardId].kind === 'bystander') {
      await ui.showCapture(state.mastermind, card, 'Master Geneticist: Bystander captured by Mr. Sinister')
    } else {
      await ui.revealCard(card, `Master Geneticist: revealed ${state.cards[card.cardId].name}`)
    }
  }

  captureForSinister(state, bystanders)
  state.villainDeck.push(...shuffle(rest))
})

registerCardAbility('sinister-plans-within-plans', async (state, { ui }) => {
  const inPile = state.defeated.filter((c) => SINISTER_TACTIC_IDS.includes(c.cardId)).length
  await captureAndShowForSinister(state, ui, captureFromSupply(state, inPile + 1)) // +1 = ta Taktyka (jeszcze nie w Victory Pile)
})

registerCardAbility('sinister-telepathic-manipulation', async (state, { ui }) => {
  const index = state.defeated.findIndex((c) => state.cards[c.cardId].kind === 'bystander')
  if (index === -1) return

  const [bystander] = state.defeated.splice(index, 1)
  await captureAndShowForSinister(state, ui, [bystander])
})

// ---------- Stryfe ----------

registerCardAbility('stryfe-furious-wrath', async (state, { ui }) => {
  const revealed = await revealFromVillainDeck(state, ui, 6, 'Furious Wrath')

  const strikes = revealed.filter((c) => state.cards[c.cardId].kind === 'masterstrike')
  const rest = revealed.filter((c) => !strikes.includes(c))

  for (const strike of strikes) await resolveVillainDeckCard(state, strike, ui)

  state.villainDeck.push(...shuffle(rest))
})

registerCardAbility('stryfe-psychic-torment', async (state, { ui }) => {
  const top = takeTopCards(state, 5)
  if (top.length === 0) return

  const chosen = await ui.choose(top, {
    prompt: 'Psychic Torment: choose a card to put into your hand',
    optional: false,
  })
  for (const card of top) {
    if (chosen && card.instanceId === chosen.instanceId) state.hand.push(card)
    else state.discard.push(card)
  }
})

registerCardAbility('stryfe-swift-vengeance', async (state, { ui }) => {
  const wound = state.wounds.pop()
  if (!wound) return
  await resolveMasterStrike(state, wound, ui)
})

registerCardAbility('stryfe-tide-of-retribution', async (state, { ui }) => {
  const xforce = revealCards(state, { team: 'x-force' })
  if (xforce.length > 0) {
    await ui.showInfo(xforce[0], 'Tide of Retribution: revealed an X-Force Hero')
    return
  }
  await gainWound(state, ui)
})