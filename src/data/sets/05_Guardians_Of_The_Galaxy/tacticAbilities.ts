/* Wzór z PTTR
import { registerCardAbility } from '../../../engine/cardAbilities'
import { feastTopCard } from '../../../engine/feast'
import { addRecruit, rescueBystander } from '../../../engine/game'
import { peekTopCard } from '../../../engine/deckOps'
import { resolveVillainDeckCard } from '../../../engine/villainPhase'
import { shuffle } from '../../../engine/random'

const isZeroCostHero = (state: Parameters<typeof feastTopCard>[0], card: { cardId: string }) =>
  !!state.cards[card.cardId].hero && (state.cards[card.cardId].cost ?? 0) === 0

registerCardAbility('carnage-drooling-jaws', async (state, { ui }) => {
  const top = peekTopCard(state)
  if (top) await ui.revealCard(top, 'Drooling Jaws: revealed the top card')
  await feastTopCard(state, ui, 'Carnage')
})
*/
import { registerCardAbility } from '../../../engine/cardAbilities'
import { discardCard } from '../../../engine/keywords'
import { gainWound } from '../../../engine/wounds'
import { placeShardsOn } from '../../../engine/shards'
import type { GameState } from '../../../engine/types'
import { SUPREME_INTELLIGENCE_OF_THE_KREE } from './cards'

const INFINITY_GEMS = 'Infinity Gems'
const KREE_STARFORCE = 'Kree Starforce'

const boundSouls = (state: GameState) =>
  state.captives[state.mastermind.instanceId] ?? []

const infinityGemArtifacts = (state: GameState) =>
  (state.artifacts ?? []).filter((artifact) => {
    const data = state.cards[artifact.cardId]
    return data.villainGroup === INFINITY_GEMS && (data.keywords ?? []).includes('artifact')
  })

registerCardAbility('supreme-intelligence-combined-knowledge-of-all-kree', async (state) => {
  const count = [...state.city, ...state.escaped].filter(
    (card) => !!card && state.cards[card.cardId].villainGroup === KREE_STARFORCE,
  ).length
  placeShardsOn(state, state.mastermind, count)
})

registerCardAbility('supreme-intelligence-cosmic-omniscience', async (state) => {
  const count = state.ko.filter((card) => state.cards[card.cardId].kind === 'masterstrike').length
  placeShardsOn(state, state.mastermind, count)
})

registerCardAbility('supreme-intelligence-countermeasure-protocols', async (state) => {
  const tacticIds = new Set(SUPREME_INTELLIGENCE_OF_THE_KREE.tactics.map((tactic) => tactic.id))
  const count = state.defeated.filter((card) => tacticIds.has(card.cardId)).length + 1
  placeShardsOn(state, state.mastermind, count)
})

registerCardAbility('supreme-intelligence-guide-kree-evolution', async (state) => {
  placeShardsOn(state, state.mastermind, 1)
  for (const villain of state.city) {
    if (villain && state.cards[villain.cardId].villainGroup === KREE_STARFORCE) {
      placeShardsOn(state, villain, 1)
    }
  }
})

registerCardAbility('thanos-centuries-of-envy', async (state, { ui }) => {
  const artifacts = infinityGemArtifacts(state)
  if (artifacts.length === 0) return

  const chosen =
    artifacts.length === 1
      ? artifacts[0]
      : await ui.choose(artifacts, {
          prompt: 'Centuries of Envy: choose an Infinity Gem Artifact to discard',
          optional: false,
        })
  if (chosen) await discardCard(state, chosen.instanceId, ui)
})

registerCardAbility('thanos-god-of-death', async (state, { ui }) => {
  const hand = [...state.hand]
  if (hand.length > 0) await ui.showCards(hand, 'God of Death: revealed hand')
  const boundNames = new Set(boundSouls(state).map((card) => state.cards[card.cardId].name))
  const wounds = hand.filter((card) => boundNames.has(state.cards[card.cardId].name)).length
  for (let i = 0; i < wounds; i++) await gainWound(state, ui)
})

registerCardAbility('thanos-keeper-of-souls', async (state, { ui }) => {
  const souls = boundSouls(state)
  const heroSouls = souls.filter((card) => !!state.cards[card.cardId].hero)
  if (heroSouls.length > 0) {
    const chosen =
      heroSouls.length === 1
        ? heroSouls[0]
        : await ui.choose(heroSouls, {
            prompt: "Keeper of Souls: choose a Hero from Thanos' Bound Souls",
            optional: false,
          })
    if (chosen) {
      state.captives[state.mastermind.instanceId] = souls.filter(
        (card) => card.instanceId !== chosen.instanceId,
      )
      state.discard.push(chosen)
    }
  }

  const heroes = state.discard.filter(
    (card) => !!state.cards[card.cardId].hero && (state.cards[card.cardId].type?.length ?? 0) > 0,
  )
  if (heroes.length === 0) return

  const chosen =
    heroes.length === 1
      ? heroes[0]
      : await ui.choose(heroes, {
          prompt: "Keeper of Souls: choose a non-grey Hero from your discard pile for Bound Souls",
          optional: false,
        })
  if (!chosen) return

  state.discard = state.discard.filter((card) => card.instanceId !== chosen.instanceId)
  state.captives[state.mastermind.instanceId] = [
    ...(state.captives[state.mastermind.instanceId] ?? []),
    chosen,
  ]
  await ui.showCapture(state.mastermind, chosen, 'Thanos captured a Hero in Bound Souls')
})

registerCardAbility('thanos-the-mad-titan', async (state, { ui }) => {
  const hand = [...state.hand]
  if (hand.length > 0) await ui.showCards(hand, 'The Mad Titan: revealed hand')
  const boundNames = new Set(boundSouls(state).map((card) => state.cards[card.cardId].name))
  for (const card of hand) {
    if (boundNames.has(state.cards[card.cardId].name)) {
      await discardCard(state, card.instanceId, ui)
    }
  }
})