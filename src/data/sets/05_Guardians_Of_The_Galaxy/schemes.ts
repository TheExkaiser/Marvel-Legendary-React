import type { CardInstance, GameState, SchemeDef } from '../../../engine/types'
import { enterCity, escapeVillain } from '../../../engine/villainPhase'
import { koFromHq, refillHq } from '../../../engine/recruit'
import { gainWound, rescueCard } from '../../../engine/wounds'
import { claimOneShardOn, placeShardsOn, shardSupply, shardsOn } from '../../../engine/shards'
import { shuffle } from '../../../engine/random'
import { logEvent } from '../../../engine/common'

const INFINITY_GEMS = 'Infinity Gems'
const KREE_STARFORCE = 'Kree Starforce'
const SKRULLS = 'Skrulls'

function isInfinityGem(state: GameState, card: CardInstance): boolean {
  const data = state.cards[card.cardId]
  return data.villainGroup === INFINITY_GEMS && (data.keywords ?? []).includes('artifact')
}

function countVillainsInCityAndEscaped(state: GameState, group: string): number {
  return [...state.city, ...state.escaped].filter(
    (card) => !!card && state.cards[card.cardId].villainGroup === group,
  ).length
}

function countEscapedByGroup(state: GameState, group: string): number {
  return state.escaped.filter((card) => state.cards[card.cardId].villainGroup === group).length
}

const FORGE_THE_INFINITY_GAUNTLET: SchemeDef = {
  id: 'gotg_forge_the_infinity_gauntlet',
  name: 'Forge the Infinity Gauntlet',
  img: '',
  twistCount: 8,
  text:
    'Setup: 8 Twists. Always include the Infinity Gems Villain Group.\n' +
    'Twist: Starting to your left and going clockwise, the first player with an Infinity Gem Artifact card in play or in their discard pile chooses one of those Infinity Gems to enter the city. Then put a Shard on each Infinity Gem in the city.\n' +
    'Evil Wins: When 6 Infinity Gem Villains are in the city and/or the Escape Pile.\n' +
    'Evil Wins: When a player controls 4 Infinity Gem Artifacts, that player is corrupted by power. That player wins, Evil wins, and all other players lose.',
  setupRules: {
    requiredVillainGroups: ['gotg_infinity_gems'],
  },
  onTwist: async (state, _twistNumber, ui) => {
    const gems = [...(state.artifacts ?? []), ...state.discard].filter((card) =>
      isInfinityGem(state, card),
    )
    if (gems.length > 0) {
      const chosen =
        gems.length === 1
          ? gems[0]
          : await ui.choose(gems, {
              prompt: 'Forge the Infinity Gauntlet (Twist): choose an Infinity Gem Artifact to enter the city',
              optional: false,
            })

      if (chosen) {
        state.artifacts = (state.artifacts ?? []).filter((card) => card.instanceId !== chosen.instanceId)
        state.discard = state.discard.filter((card) => card.instanceId !== chosen.instanceId)
        await enterCity(state, chosen, ui)
      }
    }

    for (const villain of state.city) {
      if (villain && isInfinityGem(state, villain)) placeShardsOn(state, villain, 1)
    }
  },
  checkLoss: (state) =>
    countVillainsInCityAndEscaped(state, INFINITY_GEMS) >= 6 ||
    (state.artifacts ?? []).filter((card) => isInfinityGem(state, card)).length >= 4,
}

const KREE_SKRULL_WAR: SchemeDef = {
  id: 'gotg_the_kree_skrull_war',
  name: 'The Kree-Skrull War',
  img: '',
  twistCount: 8,
  keepsTwistCard: true,
  mastermindTwistLabel: 'Kree Conquests',
  schemeTwistLabel: 'Skrull Conquests',
  text:
    'Setup: 8 Twists. Always include Kree Starforce and Skrull Villain Groups.\n' +
    'Twists 1-7: All Kree and Skrulls escape from the city. Then, if there are more Kree than Skrulls in the Escape Pile, stack this Twist next to the Mastermind as a Kree Conquest. If there are more Skrulls than Kree in the Escape Pile, stack this Twist next to the Villain Deck as a Skrull Conquest. If tied, KO this Twist.\n' +
    'Twist 8: Stack this Twist on the side with the most Conquests. If tied, KO this Twist.\n' +
    'Evil Wins: When there are 4 Kree Conquests or 4 Skrull Conquests.',
  setupRules: {
    villainGroups: 2,
    requiredVillainGroups: ['gotg_kree_starforce', 'coreset_skrulls'],
  },
  onTwist: async (state, twistNumber, ui, twist) => {
    if (twistNumber <= 7) {
      for (let i = 0; i < state.city.length; i++) {
        const villain = state.city[i]
        if (!villain) continue
        const group = state.cards[villain.cardId].villainGroup
        if (group !== KREE_STARFORCE && group !== SKRULLS) continue

        state.city[i] = null
        await escapeVillain(state, villain, ui)
      }
    }

    const kreeEscaped = countEscapedByGroup(state, KREE_STARFORCE)
    const skrullsEscaped = countEscapedByGroup(state, SKRULLS)

    let side: 'kree' | 'skrull' | null = null
    if (twistNumber === 8) {
      const kreeConquests = state.mastermindSchemeTwists?.length ?? 0
      const skrullConquests = state.schemeTwists?.length ?? 0
      if (kreeConquests > skrullConquests) side = 'kree'
      else if (skrullConquests > kreeConquests) side = 'skrull'
    } else if (kreeEscaped > skrullsEscaped) {
      side = 'kree'
    } else if (skrullsEscaped > kreeEscaped) {
      side = 'skrull'
    }

    if (side === 'kree') {
      state.mastermindSchemeTwists = [...(state.mastermindSchemeTwists ?? []), twist]
    } else if (side === 'skrull') {
      state.schemeTwists = [...(state.schemeTwists ?? []), twist]
    } else {
      state.ko.push(twist)
    }
  },
  checkLoss: (state) =>
    (state.mastermindSchemeTwists?.length ?? 0) >= 4 ||
    (state.schemeTwists?.length ?? 0) >= 4,
}

const INTERGALACTIC_KREE_NEGA_BOMB: SchemeDef = {
  id: 'gotg_intergalactic_kree_nega_bomb',
  name: 'Intergalactic Kree Nega-Bomb',
  img: '',
  twistCount: 8,
  keepsTwistCard: true,
  text:
    'Setup: 8 Twists. Make a face-down Nega-Bomb Deck of 6 Bystanders.\n' +
    'Twist: Shuffle this Twist into the Nega-Bomb Deck. Then reveal a random card from that deck. If it is a Bystander, rescue it. If it is a Twist, KO it, KO all Heroes from the HQ, and each player gains a Wound.\n' +
    'Evil Wins: When 16 non-grey Heroes are in the KO pile.',
  setup: (state) => {
    if (state.bystanders.length < 6) throw new Error('Intergalactic Kree Nega-Bomb requires 6 Bystanders')
    state.negaBombDeck = shuffle(state.bystanders.splice(0, 6))
    state.counters['Nega-Bomb Deck'] = state.negaBombDeck.length
  },
  onTwist: async (state, _twistNumber, ui, twist) => {
    state.negaBombDeck = shuffle([...(state.negaBombDeck ?? []), twist])
    const revealed = state.negaBombDeck.pop()
    state.counters['Nega-Bomb Deck'] = state.negaBombDeck.length
    if (!revealed) return

    await ui.revealCard(revealed, 'Intergalactic Kree Nega-Bomb: revealed a card from the Nega-Bomb Deck')
    if (state.cards[revealed.cardId].kind === 'bystander') {
      await rescueCard(state, revealed, ui)
      return
    }

    state.ko.push(revealed)
    for (let i = 0; i < state.hq.length; i++) {
      const hero = state.hq[i]
      if (hero && state.cards[hero.cardId].hero) koFromHq(state, i)
    }
    refillHq(state)
    await gainWound(state, ui)
  },
  checkLoss: (state) =>
    state.ko.filter((card) => {
      const data = state.cards[card.cardId]
      return !!data.hero && (data.type?.length ?? 0) > 0
    }).length >= 16,
}

const UNITE_THE_SHARDS: SchemeDef = {
  id: 'gotg_unite_the_shards',
  name: 'Unite the Shards',
  img: '',
  twistCount: 6,
  shardSupplyLimit: 30,
  text:
    'Setup: 30 Shards in the supply. Twists equal to the number of players plus 5.\n' +
    'Twist: Stack this Twist next to the Scheme. Then for each Twist in that stack, the Mastermind gains a Shard.\n' +
    "Special Rules: During your turn, any number of times, you may spend 2 Recruit to gain one of the Mastermind's Shards.\n" +
    'Evil Wins: When the Mastermind has 10 Shards or when there are no more Shards in the supply.',
  onTwist: (state, _twistNumber, _ui, twist) => {
    state.schemeTwists = [...(state.schemeTwists ?? []), twist]
    placeShardsOn(state, state.mastermind, state.schemeTwists.length)
  },
  mastermindActions: [
    {
      label: 'Claim Shard (2 Recruit)',
      canActivate: (state) =>
        state.status === 'playing' &&
        state.recruit >= 2 &&
        shardsOn(state, state.mastermind) > 0,
      activate: (state) => {
        if (state.recruit < 2) throw new Error('You need 2 Recruit to claim a Shard')
        if (shardsOn(state, state.mastermind) === 0) throw new Error('The Mastermind has no Shards')
        state.recruit -= 2
        claimOneShardOn(state, state.mastermind)
        logEvent(state, 'Spent 2 Recruit to claim a Shard from the Mastermind')
      },
    },
  ],
  checkLoss: (state) =>
    shardsOn(state, state.mastermind) >= 10 || shardSupply(state) === 0,
}

export const GUARDIANS_OF_THE_GALAXY_SCHEMES: SchemeDef[] = [
  FORGE_THE_INFINITY_GAUNTLET,
  KREE_SKRULL_WAR,
  INTERGALACTIC_KREE_NEGA_BOMB,
  UNITE_THE_SHARDS,
]
