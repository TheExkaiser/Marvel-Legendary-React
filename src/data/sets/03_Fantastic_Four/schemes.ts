import type { CardInstance, GameState, SchemeDef } from '../../../engine/types'
import { koCard } from '../../../engine/keywords'
import { koFromHq, refillHq } from '../../../engine/recruit'

const isHero = (state: GameState, card: CardInstance): boolean => state.cards[card.cardId].hero !== undefined

const isNonGreyHero = (state: GameState, card: CardInstance): boolean => {
  const data = state.cards[card.cardId]
  return isHero(state, card) && (data.type?.length ?? 0) > 0
}

const cardCost = (state: GameState, card: CardInstance): number => state.cards[card.cardId].cost ?? 0

const BATHE_THE_EARTH_IN_COSMIC_RAYS: SchemeDef = {
  id: 'fantasticfour_bathe_the_earth_in_cosmic_rays',
  name: 'Bathe the Earth in Cosmic Rays',
  img: '',
  twistCount: 6,
  text:
    'Setup: 6 Twists.\n' +
    'Twist: Each player in turn does the following: Reveal your hand. KO one of your non-grey Heroes. Choose a Hero from the HQ with the same or lower cost and put it into your hand.\n' +
    'Evil Wins: When the number of non-grey Heroes in the KO pile is six times the number of players.',

  onTwist: async (state, _twistNumber, ui) => {
    const candidates = state.hand.filter((card) => isNonGreyHero(state, card))
    if (candidates.length === 0) return

    const koChoice = await ui.choose(candidates, {
      prompt: 'Bathe the Earth in Cosmic Rays: KO a non-grey Hero from your hand',
      optional: false,
    })
    if (!koChoice) return

    const cost = cardCost(state, koChoice)
    koCard(state, koChoice.instanceId)

    const hqChoices = state.hq.filter(
      (card): card is CardInstance => !!card && isHero(state, card) && cardCost(state, card) <= cost,
    )
    if (hqChoices.length === 0) return

    const chosen = await ui.choose(hqChoices, {
      prompt: 'Bathe the Earth in Cosmic Rays: choose a Hero from the HQ to add to your hand',
      optional: false,
    })
    if (!chosen) return

    const hqIndex = state.hq.findIndex((card) => card?.instanceId === chosen.instanceId)
    if (hqIndex === -1) return
    state.hq[hqIndex] = null
    state.hand.push(chosen)
    refillHq(state)
  },

  checkLoss: (state) => state.ko.filter((card) => isNonGreyHero(state, card)).length >= 6,
}

const FLOOD_THE_PLANET_WITH_MELTED_GLACIERS: SchemeDef = {
  id: 'fantasticfour_flood_the_planet_with_melted_glaciers',
  name: 'Flood the Planet with Melted Glaciers',
  img: '',
  twistCount: 8,
  keepsTwistCard: true,
  text:
    'Setup: 8 Twists.\n' +
    'Twist: Stack the Twist next to the Scheme as "Rising Waters." Then KO each Hero from the HQ whose cost is less than or equal to the number of Rising Waters in that stack.\n' +
    "Evil Wins: When 20 non-grey Heroes are KO'd.",

  onTwist: async (state, _twistNumber, ui, twist) => {
    state.schemeTwists = [...(state.schemeTwists ?? []), twist]
    const risingWaters = state.schemeTwists.length
    const floodedHeroes: CardInstance[] = []

    for (let i = 0; i < state.hq.length; i++) {
      const hero = state.hq[i]
      if (!hero || !isHero(state, hero) || cardCost(state, hero) > risingWaters) continue
      floodedHeroes.push(hero)
      koFromHq(state, i)
    }
    refillHq(state)
    await ui.showCards(floodedHeroes, "Rising Waters: Heroes KO'd from the HQ")
  },

  checkLoss: (state) => state.ko.filter((card) => isNonGreyHero(state, card)).length >= 20,
}

const INVINCIBLE_FORCE_FIELD: SchemeDef = {
  id: 'fantasticfour_invincible_force_field',
  name: 'Invincible Force Field',
  img: '',
  twistCount: 7,
  keepsTwistCard: true,
  text:
    'Setup: 7 Twists.\n' +
    'Twist: Stack this Twist next to the Mastermind as a "Force Field."\n' +
    'Special Rules: To fight the Mastermind, you must also spend 1 Recruit or 1 Attack for each Force Field next to them.\n' +
    'Twist 7: Evil Wins!',

  onTwist: async (state, _twistNumber, _ui, twist) => {
    state.mastermindSchemeTwists = [...(state.mastermindSchemeTwists ?? []), twist]
  },

  mastermindFightAdditionalCost: (state) => state.mastermindSchemeTwists?.length ?? 0,

  beforeMastermindFight: async (state, ui, mastermindStrength) => {
    const forceFields = state.mastermindSchemeTwists?.length ?? 0
    if (forceFields === 0) return
    if (state.attack + state.recruit < forceFields) {
      throw new Error(`Not enough Attack or Recruit to pass ${forceFields} Force Field(s)`)
    }

    const maxAttackForForceFields = state.recruitCountsAsAttackThisTurn
      ? Math.min(forceFields, state.attack)
      : Math.min(forceFields, Math.max(0, state.attack - mastermindStrength))
    const { fromAttack, fromRecruit } = await ui.chooseAttackSplit(
      forceFields,
      maxAttackForForceFields,
      Math.min(forceFields, state.recruit),
    )
    state.attack -= fromAttack
    state.recruit -= fromRecruit
  },

  checkLoss: (state) => state.twistsRevealed >= 7,
}

const PULL_REALITY_INTO_THE_NEGATIVE_ZONE: SchemeDef = {
  id: 'fantasticfour_pull_reality_into_the_negative_zone',
  name: 'Pull Reality Into the Negative Zone',
  img: '',
  twistCount: 8,
  text:
    'Setup: 8 Twists.\n' +
    'Twist 2, 4, and 6: Until the next Twist, Enemies cost Recruit to fight and Heroes cost Attack to recruit.\n' +
    'Twist 7: Evil Wins!',

  onTwist: async (state, twistNumber) => {
    state.enemiesCostRecruitThisTurn = twistNumber === 2 || twistNumber === 4 || twistNumber === 6
    state.heroesCostAttackThisTurn = state.enemiesCostRecruitThisTurn
  },

  checkLoss: (state) => state.twistsRevealed >= 7,
}

export const FANTASTIC_FOUR_SCHEMES: SchemeDef[] = [
  BATHE_THE_EARTH_IN_COSMIC_RAYS,
  FLOOD_THE_PLANET_WITH_MELTED_GLACIERS,
  INVINCIBLE_FORCE_FIELD,
  PULL_REALITY_INTO_THE_NEGATIVE_ZONE,
]
