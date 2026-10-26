import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { registerDefeatRequirement } from '../../../engine/villainRequirements'
import { registerStrengthModifier } from '../../../engine/strengthModifiers'
import {
  koCard,
  discardCard,
  discardCardChecked,
  revealCards,
  revealZone,
  haveZone,
  isVillainCard,
  revealTopCards,
} from '../../../engine/keywords'
import { gainWound, drawCards } from '../../../engine/game'
import { resolveVillainDeckCard, resolveMasterStrike, playTopVillainCard, revealTopVillainCards } from '../../../engine/villainPhase'
import { shuffle } from '../../../engine/random'
import { CITY_NAMES } from '../../../engine/constants'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'
import { chooseOneCard, revealOneOr } from '../../../engine/abilityHelpers'

// ---------- Helpery ----------

async function revealTypeOr(
  state: GameState,
  ui: UiAdapter,
  type: string,
  label: string,
  prompt: string,
  otherwise: () => Promise<void>,
): Promise<void> {
  await revealOneOr(ui, revealCards(state, { type }), prompt, `${prompt}: revealed a ${label} Hero`, otherwise)
}

// ---------- Four Horsemen ----------

async function deathEffect(state: GameState, ui: UiAdapter): Promise<void> {
  const heroes = state.hand.filter((c) => {
    const data = state.cards[c.cardId]
    return data.hero !== undefined && (data.cost ?? 0) >= 1
  })
  const chosen = await chooseOneCard(ui, heroes, 'Death: KO a Hero that costs 1 or more from your hand')
  if (chosen) koCard(state, chosen.instanceId)
}

async function famineEffect(state: GameState, ui: UiAdapter): Promise<void> {
  await revealTypeOr(state, ui, 'instinct', 'an Instinct', 'Famine: reveal an Instinct Hero or discard a card', async () => {
    const chosen = await chooseOneCard(ui, state.hand, 'Famine: discard a card')
    if (chosen) await discardCard(state, chosen.instanceId, ui)
  })
}

async function pestilenceEffect(state: GameState, ui: UiAdapter): Promise<void> {
  const kept: CardInstance[] = []
  for (const card of await revealTopCards(state, ui, 3, 'Pestilence')) {
    if ((state.cards[card.cardId].cost ?? 0) >= 1) state.discard.push(card)
    else kept.push(card)
  }

  const order: CardInstance[] = [] // od wierzchu
  while (kept.length > 1) {
    const chosen = await ui.choose(kept, {
      prompt: 'Pestilence: choose the card to put on top of your deck',
      optional: false,
    })
    if (!chosen) break
    order.push(chosen)
    kept.splice(kept.findIndex((c) => c.instanceId === chosen.instanceId), 1)
  }
  order.push(...kept)

  for (let i = order.length - 1; i >= 0; i--) state.deck.push(order[i]) // koniec tablicy = wierzch
}

async function warEffect(state: GameState, ui: UiAdapter): Promise<void> {
  await revealTypeOr(state, ui, 'instinct', 'an Instinct', 'War: reveal an Instinct Hero or gain a Wound', async () => {
    await gainWound(state, ui)
  })
}

registerVillainAbilities('villain-death', { onFight: deathEffect, onEscape: deathEffect })
registerVillainAbilities('villain-famine', { onFight: famineEffect, onEscape: famineEffect })
registerVillainAbilities('villain-pestilence', { onFight: pestilenceEffect, onEscape: pestilenceEffect })
registerVillainAbilities('villain-war', { onFight: warEffect, onEscape: warEffect })

// ---------- Streets of New York ----------

// "your Heroes" = ręka + zagrane + odrzucone, z ikoną Recruit/Attack na karcie
async function koHeroWithIcon(state: GameState, ui: UiAdapter, icon: 'recruit' | 'attack'): Promise<void> {
  const heroes = haveZone(state).filter((c) => {
    const data = state.cards[c.cardId]
    return data.hero !== undefined && (data[icon] ?? 0) > 0
  })
  const label = icon === 'recruit' ? 'Recruit' : 'Attack'
  const chosen = await chooseOneCard(ui, heroes, `KO one of your Heroes with a ${label} icon`)
  if (chosen) koCard(state, chosen.instanceId)
}

registerVillainAbilities('villain-bullseye', {
  onFight: async (state, ui) => {
    await koHeroWithIcon(state, ui, 'recruit')
    await koHeroWithIcon(state, ui, 'attack')
  },
})

registerVillainAbilities('villain-hammerhead', {
  onFight: async (state, ui) => {
    await koHeroWithIcon(state, ui, 'recruit')
  },
})

registerVillainAbilities('villain-jigsaw', {
  onAmbush: async (state, ui) => {
    for (let i = 0; i < 3 && state.hand.length > 0; i++) {
      const chosen = await chooseOneCard(ui, state.hand, `Jigsaw: discard a card (${i + 1}/3)`)
      if (chosen) await discardCard(state, chosen.instanceId, ui)
    }
    drawCards(state, 2)
  },
})

registerVillainAbilities('villain-tombstone', {
  onEscape: async (state, ui) => {
    await revealTypeOr(state, ui, 'strength', 'a Strength', 'Tombstone: reveal a Strength Hero or gain a Wound', async () => {
      await gainWound(state, ui)
    })
  },
})

// ---------- Helpery: jeńcy i talia złoczyńców ----------

function topOfVillainDeck(state: GameState): CardInstance | undefined {
  return state.villainDeck[state.villainDeck.length - 1]
}

async function captureCard(state: GameState, ui: UiAdapter, villain: CardInstance, card: CardInstance): Promise<void> {
  state.captives[villain.instanceId] = [...(state.captives[villain.instanceId] ?? []), card]
  await ui.showCapture(villain, card, `Bystander captured by ${state.cards[villain.cardId].name}`)
}

async function captureFromStack(state: GameState, ui: UiAdapter, villain: CardInstance): Promise<void> {
  const bystander = state.bystanders.pop()
  if (bystander) await captureCard(state, ui, villain, bystander)
}

const bystandersOf = (state: GameState, self: CardInstance): number =>
  (state.captives[self.instanceId] ?? []).filter((c) => state.cards[c.cardId].kind === 'bystander').length

/** Odkrywa górne `count` kart talii złoczyńców, `self` łapie Bystanderów, reszta wraca w losowej kolejności. */
async function captureRevealedBystanders(state: GameState, ui: UiAdapter, self: CardInstance, count: number): Promise<void> {
  const revealed = await revealTopVillainCards(
    state,
    ui,
    count,
    `${state.cards[self.cardId].name}: top ${count} cards of the Villain Deck`,
  )
  const bystanders = revealed.filter((c) => state.cards[c.cardId].kind === 'bystander')
  state.villainDeck.push(...shuffle(revealed.filter((c) => !bystanders.includes(c))))
  for (const bystander of bystanders) await captureCard(state, ui, self, bystander)
}

async function koHeroes(state: GameState, ui: UiAdapter, count: number, prompt: string): Promise<void> {
  for (let i = 0; i < count; i++) {
    const heroes = haveZone(state).filter((c) => state.cards[c.cardId].hero !== undefined)
      const chosen = await chooseOneCard(ui, heroes, prompt)
    if (chosen) koCard(state, chosen.instanceId)
  }
}

// ---------- Emissaries of Evil ----------

registerVillainAbilities('villain-egghead', {
  onAmbush: async (state, ui) => {
    const top = topOfVillainDeck(state)
    if (!top) return
    if (isVillainCard(state.cards[top.cardId])) {
      await playTopVillainCard(state, ui)
    } else {
      await ui.showInfo(top, 'Egghead: the top card is not a Villain')
    }
  },
})

registerVillainAbilities('villain-electro', {
  onAmbush: async (state, ui) => {
    const top = topOfVillainDeck(state)
    if (!top) return
    if (state.cards[top.cardId].kind === 'twist') {
      state.villainDeck.pop()
      await resolveVillainDeckCard(state, top, ui)
    } else {
      await ui.showInfo(top, 'Electro: the top card is not a Scheme Twist')
    }
  },
})

registerVillainAbilities('villain-gladiator', {
  onAmbush: async (state, ui, self) => {
    const top = topOfVillainDeck(state)
    if (!top) return
    if (state.cards[top.cardId].kind === 'bystander') {
      state.villainDeck.pop()
      await captureCard(state, ui, self, top)
    } else {
      await ui.showInfo(top, 'Gladiator: the top card is not a Bystander')
    }
  },
})

registerVillainAbilities('villain-rhino', {
  onAmbush: async (state, ui) => {
    const top = topOfVillainDeck(state)
    if (!top) return
    if (state.cards[top.cardId].kind === 'masterstrike') {
      await ui.showInfo(top, 'Rhino: revealed a Master Strike')
      await gainWound(state, ui)
    } else {
      await ui.showInfo(top, 'Rhino: the top card is not a Master Strike')
    }
  },
  onEscape: async (state, ui) => {
    await gainWound(state, ui)
  },
})

// ---------- Marauders ----------

registerStrengthModifier('villain-blockbuster', (state, self) => 2 * bystandersOf(state, self))
registerStrengthModifier('villain-chimera', (state, self) => 3 * bystandersOf(state, self))
registerStrengthModifier('villain-scalphunter', (state, self) => bystandersOf(state, self))

registerVillainAbilities('villain-blockbuster', {
  onAmbush: async (state, ui, self) => {
    const bank = state.city[CITY_NAMES.indexOf('Bank')]
    if (!bank || bank.instanceId === self.instanceId) return
    if (!isVillainCard(state.cards[bank.cardId])) return
    await captureFromStack(state, ui, bank)
    await captureFromStack(state, ui, self)
  },
})

registerVillainAbilities('villain-chimera', {
  onAmbush: async (state, ui, self) => {
    await captureRevealedBystanders(state, ui, self, 3)
  },
})

registerVillainAbilities('villain-scalphunter', {
  onAmbush: async (state, ui, self) => {
    const index = state.defeated.findIndex((c) => state.cards[c.cardId].kind === 'bystander')
    if (index === -1) return
    const [bystander] = state.defeated.splice(index, 1) // Bystanderzy są identyczni, więc bez wyboru
    await captureCard(state, ui, self, bystander)
  },
})

registerVillainAbilities('villain-vertigo', {
  onFight: async (state, ui) => {
    let discarded = 0
    for (const card of [...state.hand]) {
      if (await discardCardChecked(state, card.instanceId, ui)) discarded++
    }
    drawCards(state, discarded)
  },
})

// ---------- MLF ----------

registerDefeatRequirement('villain-forearm', (state) => {
  const names = new Set(
    revealZone(state)
      .filter((c) => state.cards[c.cardId].hero !== undefined)
      .map((c) => state.cards[c.cardId].name),
  )
  return names.size >= 4
})

registerVillainAbilities('villain-reignfire', {
  onEscape: async (state, ui, self) => {
    state.escaped = state.escaped.filter((c) => c.instanceId !== self.instanceId) // przestaje być uciekinierem
    await resolveMasterStrike(state, self, ui)
  },
})

registerVillainAbilities('villain-wildside', {
  onFight: async (state, ui, self) => {
    const location = CITY_NAMES[state.city.findIndex((c) => c?.instanceId === self.instanceId)]
    if (location !== 'Sewers' && location !== 'Bank') return
    await koHeroes(state, ui, 2, 'Wildside (Fight): KO one of your Heroes')
  },
})

const zeroCostInHand = (state: GameState): CardInstance[] =>
  state.hand.filter((c) => {
    const data = state.cards[c.cardId]
    return data.hero !== undefined && (data.cost ?? 0) === 0
  })

registerDefeatRequirement('villain-zero', (state) => zeroCostInHand(state).length >= 3)

registerVillainAbilities('villain-zero', {
  onFight: async (state, ui) => {
    // koszt walki: wymaganie wyżej gwarantuje, że są co najmniej 3 takie karty
    for (let i = 0; i < 3; i++) {
      const chosen = await chooseOneCard(ui, zeroCostInHand(state), `Zero: discard a card that costs 0 (${i + 1}/3)`)
      if (chosen) await discardCard(state, chosen.instanceId, ui)
    }
  },
})

// ---------- Underworld ----------

registerVillainAbilities('villain-azazel', {
  onFight: async (state, ui) => {
    const options = state.hand.filter((c) => state.cards[c.cardId].kind !== 'wound')
    const chosen = await chooseOneCard(ui, options, 'Azazel: choose a card in your hand to gain Teleport this turn')
    if (chosen) state.teleportGrantedThisTurn = [...(state.teleportGrantedThisTurn ?? []), chosen.instanceId]
  },
})

async function blackheartEffect(state: GameState, ui: UiAdapter): Promise<void> {
  const chosen = await chooseOneCard(
    ui,
    revealCards(state, { team: 'marvel-knights' }),
    'Blackheart: reveal a Marvel Knights Hero or gain a Wound',
  )
  if (chosen) {
    await ui.showInfo(chosen, 'Blackheart: revealed a Marvel Knights Hero')
    return
  }
  await gainWound(state, ui)
}

registerVillainAbilities('villain-blackheart', {
  onAmbush: blackheartEffect,
  onFight: blackheartEffect,
  onEscape: blackheartEffect,
})

registerStrengthModifier('villain-dracula', (state, self) =>
  (state.captives[self.instanceId] ?? [])
    .filter((c) => state.cards[c.cardId].hero !== undefined)
    .reduce((sum, c) => sum + (state.cards[c.cardId].cost ?? 0), 0),
)

registerVillainAbilities('villain-dracula', {
  onAmbush: async (state, ui, self) => {
    const card = state.heroDeck.pop()
    if (!card) return
    state.captives[self.instanceId] = [...(state.captives[self.instanceId] ?? []), card]
    await ui.showCapture(self, card, `Dracula captures ${state.cards[card.cardId].name}`)
  },
  onFight: async (state, _ui, self) => {
    const list = state.captives[self.instanceId] ?? []
    const heroes = list.filter((c) => state.cards[c.cardId].hero !== undefined)
    state.captives[self.instanceId] = list.filter((c) => !heroes.includes(c)) // nie trafi do Victory Pile jako "uratowany"
    state.discard.push(...heroes)
  },
})

registerVillainAbilities('villain-lilith', {
  onEscape: async (state, ui) => {
    const hasDracula = state.defeated.some((c) => state.cards[c.cardId].name === 'Dracula')
    if (!hasDracula) await gainWound(state, ui)
  },
})

// ---------- Henchmen ----------

registerVillainAbilities('henchmen-maggia-goons', {
  // Ambush dotyczy Goonów tylko w schemacie Organized Crime Wave
  onAmbush: async (state, ui) => {
    if (state.schemeId !== 'darkcity_organized_crime_wave') return
    await playTopVillainCard(state, ui)
  },
  onFight: async (state, ui) => {
    await koHeroes(state, ui, 1, 'Maggia Goons (Fight): KO one of your Heroes')
  },
})

registerVillainAbilities('henchmen-phalanx', {
  onFight: async (state, ui) => {
    await revealTypeOr(
      state,
      ui,
      'tech',
      'Tech',
      'Phalanx (Fight): reveal a Tech Hero or KO one of your Heroes with an Attack icon',
      async () => {
        await koHeroWithIcon(state, ui, 'attack')
      },
    )
  },
})
