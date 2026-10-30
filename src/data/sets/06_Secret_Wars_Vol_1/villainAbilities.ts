import { registerCardAbility } from '../../../engine/cardAbilities'
import { chooseOneCard, revealOneOr } from '../../../engine/abilityHelpers'
import { registerDefeatRequirement } from '../../../engine/villainRequirements'
import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { drawCards, drawRevealed, putCardsOnTop } from '../../../engine/deckOps'
import { discardCard, koCard, matchesRampageCharacter, revealCards, revealTopCards } from '../../../engine/keywords'
import { gainWound, rescueCard } from '../../../engine/wounds'
import { ascendVillainToMastermind } from '../../../engine/ascension'
import { enterCity } from '../../../engine/villainPhase'
import { refillHq } from '../../../engine/recruit'
import { claimShardsOn } from '../../../engine/shards'
import { hasTeleport, teleportCard } from '../../../engine/turn'
import { shuffle } from '../../../engine/random'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'

const ID = 'secret-wars-zombie-'

async function riseOfTheLivingDead(state: GameState, ui: UiAdapter): Promise<void> {
  const top = state.defeated[state.defeated.length - 1]
  if (!top) return
  const data = state.cards[top.cardId]
  if (!data.villainGroup || !(data.keywords ?? []).includes('rise-of-the-living-dead')) return
  state.defeated.pop()
  await enterCity(state, top, ui)
}

for (const suffix of [
  'baron-zemo',
  'loki',
  'madame-hydra',
  'mr-sinister',
  'modok',
  'mysterio',
  'thanos',
  'venom',
]) {
  registerVillainAbilities(`${ID}${suffix}`, {
    onAmbush: (state, ui) => riseOfTheLivingDead(state, ui),
  })
}

registerVillainAbilities(`${ID}baron-zemo`, {
  onAmbush: (state, ui) => riseOfTheLivingDead(state, ui),
  onFight: async (state, ui) => {
    const avengers = state.cardsPlayedThisTurn.filter((card) =>
      !!state.cards[card.cardId].hero &&
      (state.cards[card.cardId].team ?? []).some((team) => team.toLowerCase() === 'avengers'),
    )
    for (let i = 0; i < avengers.length; i++) {
      const bystander = state.bystanders.pop()
      if (!bystander) break
      await rescueCard(state, bystander, ui)
    }
  },
})

registerVillainAbilities(`${ID}madame-hydra`, {
  onAmbush: (state, ui) => riseOfTheLivingDead(state, ui),
  onFight: async (state, ui, self) => {
    const targets = [...state.hand, ...state.discard].filter((card) => {
      const data = state.cards[card.cardId]
      return data.hero && (
        data.hero === 'S.H.I.E.L.D. Agent' ||
        data.hero === 'S.H.I.E.L.D. Trooper' ||
        (data.team ?? []).some((team) => ['s.h.i.e.l.d.', 'hydra'].includes(team.toLowerCase()))
      )
    })
    const chosen = await ui.choose(targets, {
      prompt: `${state.cards[self.cardId].name}: KO a S.H.I.E.L.D. Hero or HYDRA Ally`,
      optional: true,
    })
    if (chosen) koCard(state, chosen.instanceId)
  },
})

registerVillainAbilities(`${ID}modok`, {
  onAmbush: (state, ui) => riseOfTheLivingDead(state, ui),
  onFight: async (state, ui, self) => {
    const targets = [...state.hand, ...state.discard].filter((card) => {
      const data = state.cards[card.cardId]
      return !!data.hero && data.recruit !== undefined
    })
    const chosen = await ui.choose(targets, {
      prompt: `${state.cards[self.cardId].name}: KO one of your Heroes with a Recruit icon`,
      optional: true,
    })
    if (chosen) koCard(state, chosen.instanceId)
  },
})

registerVillainAbilities(`${ID}venom`, {
  onAmbush: (state, ui) => riseOfTheLivingDead(state, ui),
  onEscape: async (state, ui) => gainWound(state, ui),
})

registerDefeatRequirement(`${ID}venom`, (state) =>
  revealCards(state, { type: 'covert' }).some((card) => !!state.cards[card.cardId].hero),
)

const ascensionEffects: Record<string, { strikeId: string; strikeText: string }> = {
  [`${ID}loki`]: {
    strikeId: 'secret-wars-zombie-loki-master-strike',
    strikeText: 'Each player reveals a Strength Hero or gains a Wound.',
  },
  [`${ID}mr-sinister`]: {
    strikeId: 'secret-wars-zombie-sinister-master-strike',
    strikeText: 'Sinister captures a Bystander. Then, each player with exactly 6 cards reveals a Covert Hero or discards cards equal to the number of Bystanders Sinister has.',
  },
  [`${ID}thanos`]: {
    strikeId: 'secret-wars-zombie-thanos-master-strike',
    strikeText: 'Each player reveals their hand and KOs one of their non-grey Heroes.',
  },
}

for (const [cardId, effect] of Object.entries(ascensionEffects)) {
  registerVillainAbilities(cardId, {
    onAmbush: (state, ui) => riseOfTheLivingDead(state, ui),
    onEscape: async (state, _ui, self) => {
      ascendVillainToMastermind(state, self, effect.strikeId, effect.strikeText)
    },
  })
}

registerVillainAbilities(`${ID}mysterio`, {
  onAmbush: (state, ui) => riseOfTheLivingDead(state, ui),
  onEscape: async (state, _ui, self) => {
    const cardId = 'secret-wars-zombie-mysterio-tactic'
    state.cards[cardId] = {
      ...state.cards[self.cardId],
      id: cardId,
      name: 'Zombie Mysterio Tactic',
      text: 'Fight: Draw two cards.',
      villainGroup: undefined,
      keywords: [],
    }
    const tactic: CardInstance = { instanceId: self.instanceId, cardId }
    state.escaped = state.escaped.filter((card) => card.instanceId !== self.instanceId)
    state.tactics = shuffle([...state.tactics, tactic])
  },
})

registerCardAbility('secret-wars-zombie-loki-master-strike', async (state, { ui }) => {
  if (revealCards(state, { type: 'strength' }).some((card) => !!state.cards[card.cardId].hero)) return
  await gainWound(state, ui)
})

registerCardAbility('secret-wars-zombie-sinister-master-strike', async (state, { ui }) => {
  const mastermind = (state.masterminds ?? [state.mastermind]).find(
    (candidate) => candidate.instanceId === state.pendingMasterStrikeMastermindId,
  )
  if (!mastermind) return
  const bystander = state.bystanders.pop()
  if (bystander) {
    const captives = state.captives[mastermind.instanceId] ?? []
    captives.push(bystander)
    state.captives[mastermind.instanceId] = captives
    await ui.showCapture(
      mastermind,
      bystander,
      `Bystander captured by ${state.cards[mastermind.cardId].name}`,
    )
  }
  if (state.hand.length !== 6) return
  if (revealCards(state, { type: 'covert' }).some((card) => !!state.cards[card.cardId].hero)) return
  const count = (state.captives[mastermind.instanceId] ?? []).filter(
    (card) => state.cards[card.cardId].kind === 'bystander',
  ).length
  for (let i = 0; i < count && state.hand.length > 0; i++) {
    const chosen = await ui.choose(state.hand, {
      prompt: `Master Strike: discard a card (${i + 1}/${count})`,
      optional: false,
    })
    if (!chosen) break
    await discardCard(state, chosen.instanceId, ui)
  }
})

registerCardAbility('secret-wars-zombie-thanos-master-strike', async (state, { ui }) => {
  const targets = state.hand.filter((card) => {
    const data = state.cards[card.cardId]
    return !!data.hero && (data.type?.length ?? 0) > 0
  })
  if (state.hand.length > 0) await ui.showCards(state.hand, 'Zombie Thanos Master Strike: reveal your hand')
  if (targets.length === 0) return
  const chosen = await ui.choose(targets, {
    prompt: 'Zombie Thanos Master Strike: KO a non-grey Hero from your hand',
    optional: false,
  })
  if (chosen) koCard(state, chosen.instanceId)
})

registerCardAbility('secret-wars-zombie-mysterio-tactic', async (state) => {
  drawCards(state, 2)
})

const APOCALYPSE_ID = 'secret-wars-apocalyptic-'
const LIMBO_ID = 'secret-wars-inferno-'

async function revealTopCardForTeleport(
  state: GameState,
  ui: UiAdapter,
  label: string,
): Promise<void> {
  const [revealed] = await revealTopCards(state, ui, 1, label)
  if (!revealed) return
  const choice = await ui.chooseOption(
    [{ id: 'draw', label: 'Draw it' }, { id: 'teleport', label: 'Teleport it' }],
    `${label}: draw or Teleport the revealed card?`,
  )
  if (choice === 'draw') {
    drawRevealed(state, [revealed])
  } else if (choice === 'teleport') {
    state.hand.push(revealed)
    await teleportCard(state, revealed.instanceId, ui, true)
  } else {
    putCardsOnTop(state, [revealed])
  }
}

function captureForMastermind(
  state: GameState,
  ui: UiAdapter,
  bystander: CardInstance,
  captor: CardInstance,
): Promise<void> {
  const captives = state.captives[captor.instanceId] ?? []
  captives.push(bystander)
  state.captives[captor.instanceId] = captives
  return ui.showCapture(
    captor,
    bystander,
    `Bystander captured by ${state.cards[captor.cardId].name}`,
  )
}

registerVillainAbilities(`${APOCALYPSE_ID}blink`, {
  onFight: (state, ui) => revealTopCardForTeleport(state, ui, 'Apocalyptic Blink'),
})

registerVillainAbilities(`${APOCALYPSE_ID}magneto`, {
  onFight: async (state, ui, self) => {
    const xMenHeroes = state.hq.filter((card): card is CardInstance =>
      !!card && !!state.cards[card.cardId].hero &&
      (state.cards[card.cardId].team ?? []).some((team) => team.toLowerCase() === 'x-men'),
    )
    const chosen = await chooseOneCard(
      ui,
      xMenHeroes,
      `${state.cards[self.cardId].name}: gain an X-Men Hero from the HQ`,
    )
    if (!chosen) return
    const index = state.hq.findIndex((card) => card?.instanceId === chosen.instanceId)
    if (index === -1) return
    state.hq[index] = null
    claimShardsOn(state, chosen)
    state.discard.push(chosen)
    refillHq(state)
  },
  onEscape: async (state, _ui, self) => {
    ascendVillainToMastermind(
      state,
      self,
      'mastermind-magneto-master-strike',
      'Each player reveals an X-Men Hero or discards down to four cards.',
    )
  },
})

registerVillainAbilities(`${APOCALYPSE_ID}rogue`, {
  onFight: async (state, ui) => {
    const revealed = state.heroDeck[state.heroDeck.length - 1]
    if (!revealed) return
    await ui.revealCard(revealed, 'Apocalyptic Rogue: reveal the top card of the Hero Deck')
    state.heroDeck.pop()
    state.discard.push(revealed)
  },
  onEscape: async (state, ui, self) => {
    const revealed = state.heroDeck[state.heroDeck.length - 1]
    if (!revealed) return
    await ui.revealCard(revealed, 'Apocalyptic Rogue: reveal the top card of the Hero Deck')
    const classes = state.cards[revealed.cardId].type ?? []
    await ui.showCards(state.hand, 'Apocalyptic Rogue: reveal your hand')
    const matchingCards = state.hand.filter((card) =>
      (state.cards[card.cardId].type ?? []).some((type) => classes.includes(type)),
    )
    if (matchingCards.length === 0) return
    const chosen = await chooseOneCard(
      ui,
      matchingCards,
      `${state.cards[self.cardId].name}: discard a card of the revealed class`,
    )
    if (chosen) await discardCard(state, chosen.instanceId, ui)
  },
})

registerVillainAbilities(`${APOCALYPSE_ID}weapon-x`, {
  onFight: async (state, ui, self) => {
    const heroes = [...state.hand, ...state.played, ...state.discard, ...(state.artifacts ?? [])]
      .filter((card) => !!state.cards[card.cardId].hero)
    const chosen = await chooseOneCard(ui, heroes, `${state.cards[self.cardId].name}: KO one of your Heroes`)
    if (chosen) koCard(state, chosen.instanceId)
  },
  onEscape: async (state, ui, self) => {
    const wolverine = [...revealCards(state), ...state.defeated].find((card) =>
      card.instanceId !== self.instanceId && matchesRampageCharacter(state, card, 'Wolverine'),
    )
    await revealOneOr(
      ui,
      wolverine ? [wolverine] : [],
      'Cross-Dimensional Wolverine Rampage: reveal a Wolverine card.',
      'Cross-Dimensional Wolverine Rampage: revealed a Wolverine card',
      async () => gainWound(state, ui),
    )
  },
})

registerVillainAbilities(`${LIMBO_ID}colossus`, {
  onAmbush: async (state, ui) => {
    const bystander = state.bystanders.pop()
    if (bystander) await captureForMastermind(state, ui, bystander, state.mastermind)
  },
  onFight: async (state, ui, self) => {
    const heroes = [...state.hand, ...state.played, ...state.discard, ...(state.artifacts ?? [])]
      .filter((card) => !!state.cards[card.cardId].hero)
    const chosen = await chooseOneCard(ui, heroes, `${state.cards[self.cardId].name}: KO one of your Heroes`)
    if (chosen) koCard(state, chosen.instanceId)
  },
})

registerVillainAbilities(`${LIMBO_ID}cyclops`, {
  onAmbush: async (state, ui, self) => {
    const bystander = state.bystanders.pop()
    if (bystander) await captureForMastermind(state, ui, bystander, self)
  },
  onEscape: async (state, ui, _self, lostCaptives) => {
    const bystanders = lostCaptives.filter((card) => state.cards[card.cardId].kind === 'bystander')
    if (bystanders.length === 0) return
    const bystanderIds = new Set(bystanders.map((card) => card.instanceId))
    state.escapedBystanders = state.escapedBystanders.filter((card) => !bystanderIds.has(card.instanceId))
    for (const bystander of bystanders) {
      await captureForMastermind(state, ui, bystander, state.mastermind)
      if (state.hand.length === 0) continue
      const chosen = await ui.choose(state.hand, {
        prompt: 'Inferno Cyclops: discard a card for the carried-away Bystander',
        optional: false,
      })
      if (chosen) await discardCard(state, chosen.instanceId, ui)
    }
  },
})

registerVillainAbilities(`${LIMBO_ID}darkchilde`, {
  onFight: async (state, ui) => {
    const [revealed] = await revealTopCards(state, ui, 1, 'Inferno Darkchilde')
    if (!revealed) return
    const choice = await ui.chooseOption(
      [{ id: 'ko', label: 'KO it' }, { id: 'teleport', label: 'Teleport it' }],
      'Inferno Darkchilde: KO or Teleport the revealed card?',
    )
    if (choice === 'ko') {
      state.ko.push(revealed)
    } else if (choice === 'teleport') {
      state.hand.push(revealed)
      await teleportCard(state, revealed.instanceId, ui, true)
    } else {
      putCardsOnTop(state, [revealed])
    }
  },
  onEscape: async (state, ui) => {
    const randomCard = shuffle(state.hand)[0]
    if (!randomCard) return
    await teleportCard(state, randomCard.instanceId, ui, true)
  },
})

registerVillainAbilities(`${LIMBO_ID}nightcrawler`, {
  onFight: async (state, ui, self) => {
    let targets = state.hand.filter((card) =>
      state.cards[card.cardId].recruit !== undefined && !hasTeleport(state, card),
    )
    for (let i = 0; i < 2 && targets.length > 0; i++) {
      const chosen = await ui.choose(targets, {
        prompt: `${state.cards[self.cardId].name}: choose a card with a Recruit icon to gain Teleport (${i + 1}/2)`,
        optional: true,
      })
      if (!chosen) break
      state.teleportGrantedThisTurn = [...(state.teleportGrantedThisTurn ?? []), chosen.instanceId]
      targets = targets.filter((card) => card.instanceId !== chosen.instanceId)
    }
  },
})
