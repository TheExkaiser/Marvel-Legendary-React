import type { CardInstance, GameState, SchemeDef } from '../../../engine/types'
import { discardCard, getEffectiveStrength } from '../../../engine/keywords'
import { koFromHq, refillHq } from '../../../engine/recruit'
import { playTopVillainCard, checkEndConditions } from '../../../engine/villainPhase'
import { shuffle } from '../../../engine/random'
import { rescueBystander } from '../../../engine/wounds'

const isHero = (state: GameState, card: CardInstance): boolean => state.cards[card.cardId].hero !== undefined
const isNonGreyHero = (state: GameState, card: CardInstance): boolean =>
  isHero(state, card) && (state.cards[card.cardId].type?.length ?? 0) > 0

const CLONE_SAGA: SchemeDef = {
  id: 'paintred_the_clone_saga', name: 'The Clone Saga', img: '', twistCount: 8,
  text: 'Setup: 8 Twists.\nTwist: Each player reveals two non-grey Heroes with the same card name or discards down to 3 cards.\nEvil Wins: When 2 Villains with the same card name have escaped or the Villain Deck runs out.',
  onTwist: async (state, _n, ui) => {
    const pairs = new Map<string, CardInstance[]>()
    for (const card of state.hand) {
      if (!isNonGreyHero(state, card)) continue
      const name = state.cards[card.cardId].name
      pairs.set(name, [...(pairs.get(name) ?? []), card])
    }
    const pair = [...pairs.values()].find((cards) => cards.length >= 2)
    const choice = pair
      ? await ui.chooseOption(
          [
            { id: 'reveal', label: 'Reveal matching Heroes' },
            { id: 'discard', label: 'Discard down to 3 cards' },
          ],
          'The Clone Saga: reveal two matching non-grey Heroes or discard down to 3 cards',
        )
      : 'discard'
    if (choice === 'reveal' && pair) {
      await ui.showCards(pair.slice(0, 2), 'The Clone Saga: matching Heroes revealed')
      return
    }
    while (state.hand.length > 3) {
      const chosen = await ui.choose(state.hand, { prompt: 'The Clone Saga: discard a card until you have 3 cards', optional: false })
      if (!chosen) break
      await discardCard(state, chosen.instanceId, ui)
    }
  },
  checkLoss: (state) => {
    if (state.villainDeck.length === 0) return true
    const names = new Map<string, number>()
    for (const card of state.escaped) {
      const data = state.cards[card.cardId]
      if (data.villainGroup === undefined && !data.henchman) continue
      names.set(data.name, (names.get(data.name) ?? 0) + 1)
    }
    return [...names.values()].some((count) => count >= 2)
  },
}

const INVADE_DAILY_BUGLE: SchemeDef = {
  id: 'paintred_invade_the_daily_bugle_news_hq', name: 'Invade the Daily Bugle News HQ', img: '', twistCount: 8,
  canFightVillainsInHq: true,
  text: 'Setup: 8 Twists. Add 6 extra Henchmen from a single Henchman Group to the Hero Deck.\nSpecial Rules: You can fight Villains in the HQ.\nTwist: KO a Hero from the HQ. Put the highest-Attack Villain from the city into that HQ space.\nEvil Wins: When there are 5 Villains in the HQ.',
  setup: (state) => {
    const henchman = Object.values(state.cards).find((card) => card.henchman)
    if (!henchman) return
    for (let i = 0; i < 6; i++) state.heroDeck.push({ instanceId: `scheme-daily-bugle-${henchman.id}-${i + 1}`, cardId: henchman.id })
    state.heroDeck = shuffle(state.heroDeck)
  },
  onTwist: async (state, _n, ui) => {
    const heroChoices = state.hq.filter((card): card is CardInstance => !!card && isHero(state, card))
    if (heroChoices.length === 0) return
    const chosenHero = heroChoices.length === 1
      ? heroChoices[0]
      : await ui.choose(heroChoices, {
          prompt: 'Invade the Daily Bugle News HQ: choose a Hero to KO from the HQ',
          optional: false,
        })
    if (!chosenHero) return
    const hqIndex = state.hq.findIndex((card) => card?.instanceId === chosenHero.instanceId)
    if (hqIndex === -1) return
    koFromHq(state, hqIndex)
    let bestIndex = -1
    let bestStrength = -1
    state.city.forEach((villain, index) => {
      if (!villain) return
      const strength = getEffectiveStrength(state, villain) ?? 0
      if (strength > bestStrength) { bestStrength = strength; bestIndex = index }
    })
    if (bestIndex === -1) { refillHq(state); return }
    const villain = state.city[bestIndex]!
    state.city[bestIndex] = null
    state.hq[hqIndex] = villain
    await ui.showInfo(villain, `Invade the Daily Bugle News HQ: ${state.cards[villain.cardId].name} enters the HQ`)
  },
  checkLoss: (state) => state.hq.filter((card) => !!card && !isHero(state, card)).length >= 5,
}

const SPLICE_HUMANS_WITH_SPIDER_DNA: SchemeDef = {
  id: 'paintred_splice_humans_with_spider_dna', name: 'Splice Humans with Spider DNA', img: '', twistCount: 8,
  allHeroesHaveWallCrawl: true,
  setupRules: { requiredVillainGroups: ['paint_red_sinister_six'] },
  text: 'Setup: 8 Twists. Include Sinister Six as one of the Villain Groups.\nSpecial Rules: Sinister Six Villains get +3 Attack. All Hero cards have Wall-Crawl.\nTwist: Each player puts a Sinister Six Villain from their Victory Pile on top of the Villain Deck. No matter how many players did so, play a single card from the Villain Deck.\nEvil Wins: When 6 Sinister Six Villains have escaped or the Villain Deck runs out.',
  onTwist: async (state, _n, ui) => {
    const candidates = state.defeated.filter((card) => state.cards[card.cardId].villainGroup === 'Sinister Six')
    if (candidates.length > 0) {
      const chosen = candidates.length === 1 ? candidates[0] : await ui.choose(candidates, { prompt: 'Splice Humans with Spider DNA: put a Sinister Six Villain on top of the Villain Deck', optional: false })
      if (chosen) {
        state.defeated = state.defeated.filter((card) => card.instanceId !== chosen.instanceId)
        state.villainDeck.push(chosen)
      }
    }
    await playTopVillainCard(state, ui)
    checkEndConditions(state)
  },
  villainStrengthModifier: (state, instance) => state.cards[instance.cardId].villainGroup === 'Sinister Six' ? 3 : 0,
  checkLoss: (state) => state.villainDeck.length === 0 || state.escaped.filter((card) => state.cards[card.cardId].villainGroup === 'Sinister Six').length >= 6,
}

const WEAVE_A_WEB_OF_LIES: SchemeDef = {
  id: 'paintred_weave_a_web_of_lies', name: 'Weave a Web of Lies', img: '', twistCount: 7, keepsTwistCard: true,
  mastermindTwistLabel: 'Web of Lies',
  text: 'Setup: 7 Twists.\nSpecial Rules: Whenever you defeat a Villain, you may pay 1 Recruit. If you do, rescue a Bystander. You can’t fight the Mastermind unless you have a Bystander in your Victory Pile for each Twist next to the Mastermind.\nTwist: Stack this Twist next to the Mastermind.\nTwist 7: Evil Wins!',
  onTwist: async (state, _n, _ui, twist) => { state.mastermindSchemeTwists = [...(state.mastermindSchemeTwists ?? []), twist] },
  beforeMastermindFight: async (state) => {
    const bystanders = state.defeated.filter((card) => state.cards[card.cardId].kind === 'bystander').length
    const required = state.mastermindSchemeTwists?.length ?? 0
    if (bystanders < required) throw new Error(`You need ${required} Bystander${required === 1 ? '' : 's'} in your Victory Pile to fight the Mastermind`)
  },
  afterVillainDefeated: async (state, _villain, ui) => {
    if (state.recruit < 1 || state.bystanders.length === 0) return
    const choice = await ui.chooseOption(
      [{ id: 'rescue', label: 'Pay 1 Recruit to rescue a Bystander' }, { id: 'skip', label: 'Do not pay' }],
      'Weave a Web of Lies: rescue a Bystander?',
    )
    if (choice !== 'rescue') return
    state.recruit -= 1
    await rescueBystander(state, ui)
  },
  checkLoss: (state) => state.twistsRevealed >= 7,
}

export const PAINT_THE_TOWN_RED_SCHEMES: SchemeDef[] = [CLONE_SAGA, INVADE_DAILY_BUGLE, SPLICE_HUMANS_WITH_SPIDER_DNA, WEAVE_A_WEB_OF_LIES]
