import { registerCardAbility } from '../../../engine/cardAbilities'
import {
  copyableArtifactAbilities,
  registerArtifactAbilities,
  registerArtifactReactions,
  runArtifactAbility,
} from '../../../engine/artifacts'
import { addAttack, drawCards } from '../../../engine/game'
import {
  countPlayedThisTurn,
  discardCardChecked,
  koCard,
  revealCards,
  villainsIn,
} from '../../../engine/keywords'
import { discardTopCard, revealTopCard } from '../../../engine/deckOps'
import { gainShards, placeShardsOn, shardSupply, spendShardsForAttack } from '../../../engine/shards'
import type { CardInstance, GameState } from '../../../engine/types'

const GOTG = 'guardians-of-the-galaxy'

const villainsInCity = (state: GameState): CardInstance[] =>
  villainsIn(state, state.city.filter((card): card is CardInstance => !!card))

// ---------- Drax the Destroyer ----------

registerArtifactAbilities('hero-drax-the-destroyer-knives-of-the-hunter', [
  {
    id: 'attack',
    label: '+1 Attack',
    effect: async (state) => {
      addAttack(state, 1)
    },
  },
])

registerCardAbility('hero-drax-the-destroyer-interstellar-tracker', async (state, { ui }) => {
  const card = await revealTopCard(state, ui, 'Interstellar Tracker: top card of your deck')
  if (!card) return
  const discard = await ui.choose([card], { prompt: 'Interstellar Tracker: discard the top card?', optional: true })
  if (!discard) return
  const discarded = discardTopCard(state)
  if (!discarded || countPlayedThisTurn(state, { type: 'instinct' }) === 0) return
  const ko = await ui.choose([discarded], { prompt: 'Interstellar Tracker: KO the discarded card?', optional: true })
  if (ko) koCard(state, discarded.instanceId)
})

registerCardAbility('hero-drax-the-destroyer-the-destroyer', async (state, { self, ui }) => {
  if (countPlayedThisTurn(state, { team: GOTG }) === 0) return
  // "Each other player" = gracz; sama The Destroyer nie liczy się jako odkrywany Instinct Hero
  const instinct = revealCards(state, { type: 'instinct' }).filter((card) => card.instanceId !== self.instanceId)
  if (instinct.length > 0) {
    const revealed = await ui.choose(instinct, {
      prompt: 'The Destroyer: reveal an Instinct Hero (cancel to discard an Artifact instead)',
      optional: true,
    })
    if (revealed) {
      await ui.showInfo(revealed, 'The Destroyer: revealed an Instinct Hero')
      return
    }
  }
  const artifacts = state.artifacts ?? []
  if (artifacts.length === 0) return
  const chosen = await ui.choose(artifacts, { prompt: 'The Destroyer: discard an Artifact you control', optional: false })
  if (chosen && (await discardCardChecked(state, chosen.instanceId, ui))) gainShards(state, 1)
})

registerCardAbility('hero-drax-the-destroyer-avatar-of-destruction', async (state) => {
  addAttack(state, state.attack)
})

// ---------- Gamora ----------

registerCardAbility('hero-gamora-bounty-hunter', async (state, { ui }) => {
  const targets = villainsInCity(state)
  if (targets.length === 0) return
  const chosen =
    targets.length === 1
      ? targets[0]
      : await ui.choose(targets, { prompt: 'Bounty Hunter: choose a Villain to gain a Shard', optional: false })
  if (chosen) placeShardsOn(state, chosen, 1)
})

registerCardAbility('hero-gamora-deadliest-woman-in-the-universe', async (state) => {
  gainShards(state, 2)
  if (countPlayedThisTurn(state, { type: 'covert' }) > 0) gainShards(state, 1)
})

registerCardAbility('hero-gamora-galactic-assassin', async (state, { ui }) => {
  const targets = villainsInCity(state)
  if (targets.length > 0) {
    const chosen =
      targets.length === 1
        ? targets[0]
        : await ui.choose(targets, {
            prompt: 'Galactic Assassin: choose a Villain that gets no Attack from Shards this turn',
            optional: false,
          })
    if (chosen) state.shardAttackSuppressedThisTurn = [...(state.shardAttackSuppressedThisTurn ?? []), chosen.instanceId]
  }
  if (countPlayedThisTurn(state, { type: 'covert' }) >= 2) {
    state.shardAttackSuppressedThisTurn = [...(state.shardAttackSuppressedThisTurn ?? []), state.mastermind.instanceId]
  }
})

registerArtifactAbilities('hero-gamora-godslayer-blade', [
  {
    id: 'gain-shards',
    label: 'Gain 2 Shards',
    isUsable: (state) => shardSupply(state) > 0,
    effect: async (state) => {
      gainShards(state, 2)
    },
  },
  {
    id: 'spend-shards',
    label: '5 Shards: +10 Attack',
    isUsable: (state) => (state.shards ?? 0) >= 5,
    effect: async (state) => {
      spendShardsForAttack(state, 5, 10)
    },
  },
])

// ---------- Groot ----------

registerCardAbility('hero-groot-prune-the-growths', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'strength' }) === 0) return
  const options = [...state.hand, ...state.discard]
  if (options.length === 0) return
  const chosen = await ui.choose(options, {
    prompt: 'Prune the Growths: KO a card from your hand or discard pile to gain a Shard',
    optional: true,
  })
  if (!chosen) return
  koCard(state, chosen.instanceId)
  gainShards(state, 1)
})

registerCardAbility('hero-groot-surviving-sprig', async (state) => {
  state.bonusDrawNextTurn += 1 // dodatkowa karta przy dobraniu nowej ręki na koniec tej tury
})

registerCardAbility('hero-groot-groot-and-branches', async (state) => {
  gainShards(state, 2)
  state.shardsAsRecruitThisTurn = true // Shardy można w tej turze wydawać także na Recruit (licznik Shardów pyta o zasób)
  // "Another player" = gracz (zasada projektu), więc zysk Sharda trafia do niego
  if (countPlayedThisTurn(state, { type: 'covert' }) > 0) gainShards(state, 1)
})

registerCardAbility('hero-groot-i-am-groot', async (state) => {
  state.shardsOnNextRecruitThisTurn = true // obsługuje recruit.ts przy następnej rekrutacji Bohatera
})

// ---------- Rocket Raccoon ----------

registerCardAbility('hero-rocket-raccoon-gritty-scavenger', async (state, { ui }) => {
  if (state.hand.length === 0) return
  const chosen = await ui.choose(state.hand, { prompt: 'Gritty Scavenger: discard a card to draw a card', optional: true })
  if (chosen && (await discardCardChecked(state, chosen.instanceId, ui))) drawCards(state, 1)
})

registerCardAbility('hero-rocket-raccoon-trigger-happy', async (state) => {
  gainShards(state, countPlayedThisTurn(state, { team: GOTG }))
})

// Artifact: bez zdolności "raz na turę", tylko reakcje silnika na koniec Master Strike'a i Ambusha
registerArtifactReactions('hero-rocket-raccoon-incoming-detector', {
  'master-strike-completed': async (state) => {
    gainShards(state, 1) // "you may": zawsze opłaca się wziąć, więc bez pytania
  },
  'ambush-completed': async (state) => {
    gainShards(state, 1)
  },
})

registerCardAbility('hero-rocket-raccoon-vengeance-is-rocket', async (state) => {
  if (countPlayedThisTurn(state, { type: 'tech' }) === 0) return
  const inKo = state.ko.filter((card) => state.cards[card.cardId].kind === 'masterstrike').length
  addAttack(state, inKo + (state.stackedMasterStrikes?.length ?? 0))
})

// ---------- Star-Lord ----------

registerArtifactAbilities('hero-star-lord-element-guns', [
  {
    id: 'gain-shard',
    label: 'Gain a Shard',
    isUsable: (state) => shardSupply(state) > 0,
    effect: async (state) => {
      gainShards(state, 1)
    },
  },
])

registerCardAbility('hero-star-lord-legendary-outlaw', async (state, { ui }) => {
  const options = copyableArtifactAbilities(state)
  if (options.length === 0) return

  const artifacts = options
    .map((option) => option.artifact)
    .filter((artifact, i, all) => all.findIndex((a) => a.instanceId === artifact.instanceId) === i)
  const artifact =
    artifacts.length === 1
      ? artifacts[0]
      : await ui.choose(artifacts, {
          prompt: 'Legendary Outlaw: choose an Artifact with a "once per turn" ability',
          optional: false,
        })
  if (!artifact) return

  const abilities = options.filter((option) => option.artifact.instanceId === artifact.instanceId).map((o) => o.ability)
  const abilityId =
    abilities.length === 1
      ? abilities[0].id
      : await ui.chooseOption(
          abilities.map((ability) => ({ id: ability.id, label: ability.label })),
          'Legendary Outlaw: play a copy of one of these abilities',
        )
  if (!abilityId) return

  await runArtifactAbility(state, ui, artifact, abilityId) // kopia: nie zużywa limitu oryginału
})

registerArtifactAbilities('hero-star-lord-implanted-memory-chip', [
  {
    id: 'draw',
    label: 'Draw a card',
    isUsable: (state) => state.deck.length + state.discard.length > 0,
    effect: async (state) => {
      drawCards(state, 1)
    },
  },
])

registerArtifactAbilities('hero-star-lord-sentient-starship', [
  {
    id: 'gain-shards',
    label: 'Gain Shards per Artifact',
    isUsable: (state) => shardSupply(state) > 0,
    effect: async (state) => {
      gainShards(state, (state.artifacts ?? []).length)
    },
  },
])
