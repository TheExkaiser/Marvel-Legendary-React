import { registerCardAbility } from '../../../engine/cardAbilities'
import { registerDefeatRequirement } from '../../../engine/villainRequirements'
import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { drawCards } from '../../../engine/deckOps'
import { discardCard, koCard, revealCards } from '../../../engine/keywords'
import { gainWound, rescueCard } from '../../../engine/wounds'
import { ascendVillainToMastermind } from '../../../engine/ascension'
import { enterCity } from '../../../engine/villainPhase'
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
