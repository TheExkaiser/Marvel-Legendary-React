import type { CardInstance, GameState, SchemeDef } from '../../../engine/types'
import { chooseOneCard, revealOneOr } from '../../../engine/abilityHelpers'
import { ascendVillainToMastermind } from '../../../engine/ascension'
import { registerCardAbility } from '../../../engine/cardAbilities'
import { getCardData } from '../../../engine/cardData'
import { chargeAllVillains } from '../../../engine/charge'
import { logEvent } from '../../../engine/common'
import { fatefulResurrectionVillain } from '../../../engine/fatefulResurrection'
import { discardCard, isVillainCard, revealCards } from '../../../engine/keywords'
import { schemeCircleOfKungFuBonus } from '../../../engine/kungFu'
import { shuffle } from '../../../engine/random'
import { fatefulResurrectionTactic } from '../../../engine/tacticReturn'
import type { UiAdapter } from '../../../engine/ui'
import { enterCity, escapeVillain, playTopVillainCard } from '../../../engine/villainPhase'
import { gainVillainAsHero } from '../../../engine/cardData'
import { CITY_NAMES } from '../../../engine/constants'

// Secret Wars: Twisty 1-3 dodają do gry po jednym losowym innym Mastermindzie z jednym Tacticiem
// (wzorzec Dark Alliance z Vol. 1; extraMasterminds losuje ich w setupie, tu wchodzą do gry).
const SECRET_WARS: SchemeDef = {
  id: 'secret_wars_2_secret_wars',
  name: 'Secret Wars',
  img: '',
  twistCount: 8,
  extraMasterminds: 3,
  text:
    'Setup: 8 Twists.\n' +
    'Twists 1-3: Add another random Mastermind to the game with one Tactic.\n' +
    'Twist 8: Evil wins!',
  onTwist: async (state, twistNumber, ui) => {
    if (twistNumber > 3) return
    const joining = state.extraMasterminds?.[twistNumber - 1]
    if (!joining) return
    const mastermind: CardInstance = { instanceId: joining.card.id, cardId: joining.card.id }
    const [tactic] = shuffle(joining.tactics.map((candidate) => ({ instanceId: candidate.id, cardId: candidate.id })))
    state.masterminds = [...(state.masterminds ?? [state.mastermind]), mastermind]
    state.mastermindStrikeIds = { ...state.mastermindStrikeIds, [mastermind.instanceId]: joining.masterStrikeId }
    state.mastermindTactics = { ...state.mastermindTactics, [mastermind.instanceId]: tactic ? [tactic] : [] }
    state.mastermindTacticReserve = { ...state.mastermindTacticReserve, [mastermind.instanceId]: [] }
    logEvent(state, `Secret Wars: ${joining.card.name} joins the game`)
    await ui.revealCard(mastermind, 'Secret Wars: another Mastermind joins the game')
  },
  checkLoss: (state) => state.twistsRevealed >= 8,
}

// Deadlands Hordes Charge the Wall: Twist = wszyscy Villainowie szarżują jednocześnie o 2 pola, potem zagraj kolejną kartę z Villain Deck.
// Evil Wins przy liczbie uciekinierów równej liczbie graczy + 6 (solo: 7).
const DEADLANDS_HORDES_CHARGE_THE_WALL: SchemeDef = {
  id: 'secret_wars_2_deadlands_hordes_charge_the_wall',
  name: 'Deadlands Hordes Charge the Wall',
  img: '',
  twistCount: 8,
  extraVillainGroups: 1,
  escapeLimit: 7,
  text:
    'Setup: 8 Twists. Add an extra Villain Group.\n' +
    'Twist: Each Villain simultaneously charges two spaces. Play another card from the Villain Deck.\n' +
    'Evil Wins: When the number of escaped Villains equals the number of players plus 6.',
  onTwist: async (state, _twistNumber, ui) => {
    await chargeAllVillains(state, ui, 2)
    await playTopVillainCard(state, ui)
  },
}

// Master the Mysteries of Kung-Fu: Twisty układają się obok Schematu, a Villainowie i Mastermind mają Circle of Kung-Fu równy liczbie
// tych Twistów (z własnym Circle karty liczy się tylko najwyższy). Evil Wins przy podwójnej liczbie uciekinierów (solo: 2).
const MASTER_THE_MYSTERIES_OF_KUNG_FU: SchemeDef = {
  id: 'secret_wars_2_master_the_mysteries_of_kung_fu',
  name: 'Master the Mysteries of Kung-Fu',
  img: '',
  twistCount: 8,
  keepsTwistCard: true,
  escapeLimit: 2,
  text:
    'Setup: 8 Twists.\n' +
    'Twist: Stack this Twist next to the Scheme.\n' +
    'Special Rules: Villains and the Mastermind have the Circle of Kung-Fu matching the number of Twists stacked here.\n' +
    'Evil Wins: When the number of escaped Villains is double the number of players.',
  onTwist: async (state, _twistNumber, _ui, twist) => {
    state.schemeTwists = [...(state.schemeTwists ?? []), twist]
  },
  villainStrengthModifier: (state, instance) => schemeCircleOfKungFuBonus(state, instance, state.schemeTwists?.length ?? 0),
}

// The Fountain of Eternal Life: wszyscy Villainowie i Tactics mają "Fight: Fateful Resurrection". Solo: 4 Twisty, limit uciekinierów 3.
// Zdolności własne kart z Fateful Resurrection nie dublują się: drugie odkrycie tej samej karty niczego nie zmienia.
const THE_FOUNTAIN_OF_ETERNAL_LIFE: SchemeDef = {
  id: 'secret_wars_2_the_fountain_of_eternal_life',
  name: 'The Fountain of Eternal Life',
  img: '',
  twistCount: 4,
  keepsTwistCard: true,
  escapeLimit: 3,
  text:
    'Setup: 8 Twists. (1 player: 4 Twists.)\n' +
    'Special Rules: All Villains and Mastermind Tactics have "Fight: Fateful Resurrection."\n' +
    'Twist: A Villain from your Victory Pile enters the Sewers. Put this Twist on the bottom of the Villain Deck.\n' +
    'Evil Wins: When the number of escaped Villains is 3 times the number of players.',
  onTwist: async (state, _twistNumber, ui, twist) => {
    const villains = state.defeated.filter((card) => isVillainCard(getCardData(state, card)))
    const chosen = await chooseOneCard(ui, villains, 'The Fountain of Eternal Life: choose a Villain from your Victory Pile to enter the Sewers')
    if (chosen) {
      state.defeated = state.defeated.filter((card) => card.instanceId !== chosen.instanceId)
      await enterCity(state, chosen, ui)
    }
    state.villainDeck.unshift(twist) // spód talii Villainów to początek tablicy
  },
  afterVillainDefeated: async (state, villain, ui) => {
    await fatefulResurrectionVillain(state, ui, villain)
  },
  afterTacticClaimed: async (state, tactic, mastermind, ui) => {
    await fatefulResurrectionTactic(state, ui, tactic, mastermind.cardId)
  },
}

// Enthrone the Barons of Battleworld: Villain z najwyższym drukowanym Attackiem wznosi się na Mastermina (+2 Attack).
// Twisty 1-7: z miasta lub Escape Pile, Twist 8: z Victory Pile. Evil Wins przy sześciu Mastermindach w grze (żywych: główny, dodatkowi i wzniesieni).
const BARONS_STRIKE_ID = 'secret-wars-2-barons-master-strike'
const BARONS_STRIKE_TEXT = "Each Player discards a card with cost equal to this Mastermind's printed VP."

const printedAttack = (state: GameState, card: CardInstance): number => state.cards[card.cardId].strength ?? 0
const isVillainCardInstance = (state: GameState, card: CardInstance): boolean => isVillainCard(getCardData(state, card))
const livingMasterminds = (state: GameState): CardInstance[] =>
  (state.masterminds ?? [state.mastermind]).filter((mastermind) => !(state.defeatedMastermindIds ?? []).includes(mastermind.instanceId))

async function enthrone(state: GameState, ui: UiAdapter, pool: CardInstance[]): Promise<void> {
  if (pool.length === 0) return
  const highest = Math.max(...pool.map((card) => printedAttack(state, card)))
  const chosen = await chooseOneCard(
    ui,
    pool.filter((card) => printedAttack(state, card) === highest),
    'Enthrone the Barons: this Villain ascends to become a new Mastermind',
  )
  if (!chosen) return
  for (let i = 0; i < state.city.length; i++) if (state.city[i]?.instanceId === chosen.instanceId) state.city[i] = null
  state.defeated = state.defeated.filter((card) => card.instanceId !== chosen.instanceId)
  ascendVillainToMastermind(state, chosen, BARONS_STRIKE_ID, BARONS_STRIKE_TEXT) // zdejmuje też z Escape Pile
  state.mastermindAttackModifiers = {
    ...state.mastermindAttackModifiers,
    [chosen.instanceId]: (state.mastermindAttackModifiers?.[chosen.instanceId] ?? 0) + 2,
  }
  await ui.revealCard(
    { instanceId: chosen.instanceId, cardId: `ascended-${chosen.instanceId}` },
    'Enthrone the Barons: a Villain ascends to become a new Mastermind',
  )
}

// Master Strike takiego Mastermina: odrzuć kartę o koszcie równym jego drukowanemu VP
registerCardAbility(BARONS_STRIKE_ID, async (state, { ui }) => {
  const mastermind = (state.masterminds ?? []).find((card) => card.instanceId === state.pendingMasterStrikeMastermindId)
  if (!mastermind) return
  const vp = state.cards[mastermind.cardId].vp ?? 0
  const options = state.hand.filter((card) => (getCardData(state, card).cost ?? 0) === vp)
  const chosen = await chooseOneCard(ui, options, `Master Strike: discard a card that costs ${vp}`)
  if (chosen) await discardCard(state, chosen.instanceId, ui)
})

const ENTHRONE_THE_BARONS_OF_BATTLEWORLD: SchemeDef = {
  id: 'secret_wars_2_enthrone_the_barons_of_battleworld',
  name: 'Enthrone the Barons of Battleworld',
  img: '',
  twistCount: 8,
  text:
    'Setup: 8 Twists.\n' +
    'Twists 1-7: The Villain in the city or Escape Pile with the highest printed Attack ascends to become a new Mastermind. It gets +2 Attack. It gains the ability "Master Strike: Each Player discards a card with cost equal to this Mastermind\'s printed VP." (Keep them separate from any Villains who ascend through Escape effects.)\n' +
    'Twist 8: The Villain in each player\'s Victory Pile with the highest printed Attack ascends the same way.\n' +
    'Evil Wins: When there are six Masterminds.',
  onTwist: async (state, twistNumber, ui) => {
    if (twistNumber >= 8) {
      await enthrone(state, ui, state.defeated.filter((card) => isVillainCardInstance(state, card)))
      return
    }
    const inCity = state.city.filter((card): card is CardInstance => !!card && isVillainCardInstance(state, card))
    const escaped = state.escaped.filter((card) => isVillainCardInstance(state, card))
    await enthrone(state, ui, [...inCity, ...escaped])
  },
  checkLoss: (state) => livingMasterminds(state).length >= 6,
}

// The God-Emperor of Battleworld: Twist 1 tworzy Mastermina God-Emperor (9 Attack, 9 VP), Twisty 2-6 dodają mu +2 Attack,
// Twist 7 KO-uje pozostałych Mastermindów (oznaczamy ich jako pokonanych), Twist 8: Evil wins, jeśli jakikolwiek Mastermind żyje.
const GOD_EMPEROR_ID = 'secret-wars-2-god-emperor'
const GOD_EMPEROR_STRIKE_ID = 'secret-wars-2-god-emperor-master-strike'

registerCardAbility(GOD_EMPEROR_STRIKE_ID, async (state, { ui }) => {
  if (state.hand.length !== 6) return
  const techHeroes = revealCards(state).filter((card) => {
    const data = getCardData(state, card)
    return !!data.hero && (data.type ?? []).includes('tech')
  })
  await revealOneOr(ui, techHeroes, 'Master Strike: reveal a tech Hero', 'Revealed a tech Hero', async () => {
    for (let i = 0; i < 2; i++) {
      const chosen = await ui.choose(state.hand, {
        prompt: `Master Strike: put a card from your hand on top of your deck (${i + 1}/2)`,
        optional: false,
      })
      if (!chosen) continue
      state.hand = state.hand.filter((card) => card.instanceId !== chosen.instanceId)
      state.deck.push(chosen) // wierzch talii to koniec tablicy
    }
  })
})

const THE_GOD_EMPEROR_OF_BATTLEWORLD: SchemeDef = {
  id: 'secret_wars_2_the_god_emperor_of_battleworld',
  name: 'The God-Emperor of Battleworld',
  img: '',
  twistCount: 8,
  keepsTwistCard: true,
  text:
    'Setup: 8 Twists.\n' +
    'Twist 1: This Scheme ascends to becomes (sic) a new 9-Attack "God-Emperor" Mastermind worth 9 VP. It has "Master Strike: Each player with exactly six cards in hand reveals a tech Hero or puts two cards from their hand on top of their deck."\n' +
    'Twist 2-6: Stack this Twist next to the Scheme. The God-Emperor gets another +2 Attack.\n' +
    'Twist 7: If the God-Emperor lives, it KOs all other Masterminds.\n' +
    'Twist 8: Evil wins! (If any Mastermind still lives.)',
  onTwist: async (state, twistNumber, ui, twist) => {
    const godEmperorLives = (): boolean => livingMasterminds(state).some((card) => card.instanceId === GOD_EMPEROR_ID)
    if (twistNumber === 1) {
      state.ko.push(twist)
      state.cards[GOD_EMPEROR_ID] = { id: GOD_EMPEROR_ID, name: 'God-Emperor', img: '', strength: 9, vp: 9 }
      ascendVillainToMastermind(
        state,
        { instanceId: GOD_EMPEROR_ID, cardId: GOD_EMPEROR_ID },
        GOD_EMPEROR_STRIKE_ID,
        'Each player with exactly six cards in hand reveals a tech Hero or puts two cards from their hand on top of their deck.',
      )
      await ui.revealCard({ instanceId: GOD_EMPEROR_ID, cardId: `ascended-${GOD_EMPEROR_ID}` }, 'The God-Emperor of Battleworld: the Scheme ascends to become a Mastermind')
    } else if (twistNumber <= 6) {
      state.schemeTwists = [...(state.schemeTwists ?? []), twist]
      state.mastermindAttackModifiers = {
        ...state.mastermindAttackModifiers,
        [GOD_EMPEROR_ID]: (state.mastermindAttackModifiers?.[GOD_EMPEROR_ID] ?? 0) + 2,
      }
    } else {
      state.ko.push(twist)
      if (twistNumber === 7 && godEmperorLives()) {
        const others = livingMasterminds(state).filter((card) => card.instanceId !== GOD_EMPEROR_ID)
        state.defeatedMastermindIds = [...(state.defeatedMastermindIds ?? []), ...others.map((card) => card.instanceId)]
        logEvent(state, 'The God-Emperor KOs all other Masterminds')
      }
    }
  },
  checkLoss: (state) => state.twistsRevealed >= 8 && livingMasterminds(state).length > 0,
}

const THE_MARK_OF_KHONSHU: SchemeDef = {
  id: 'secret_wars_2_the_mark_of_khonshu',
  name: 'The Mark of Khonshu',
  img: '',
  twistCount: 10,
  setupRules: {
    villainDeckHeroes: 1,
    requiredHenchmenGroups: ['secret-wars-2-khonshu-guardians'],
  },
  text:
    'Setup: 10 Twists. Always include Khonshu Guardians. Add all fourteen cards for an extra Hero to the Villain Deck.\n' +
    'Special Rules: Heroes in the Villain Deck are Khonshu Guardian Villains with Attack equal to their printed cost. While in the Sewers, Rooftops, or Bridge, they have double Attack. When defeated, gain them as Heroes.\n' +
    'Twist: Play two cards from the Villain Deck.\nEvil Wins: When 7 Khonshu Guardians escape.',
  onVillainDeckCard: (state, card) => {
    const data = state.cards[card.cardId]
    if (!data.hero) return false
    state.instanceOverrides = {
      ...state.instanceOverrides,
      [card.instanceId]: { data: { hero: undefined, villainGroup: 'Khonshu Guardians', strength: data.cost ?? 0 } },
    }
    return false
  },
  villainBaseStrengthOverride: (state, instance) => {
    const base = state.cards[instance.cardId]
    return base.hero ? (base.cost ?? 0) : undefined
  },
  villainStrengthModifier: (state, instance) => {
    const data = state.cards[instance.cardId]
    if (!data.hero) return 0
    const index = state.city.findIndex((card) => card?.instanceId === instance.instanceId)
    return index >= 0 && ['Sewers', 'Rooftops', 'Bridge'].includes(CITY_NAMES[index])
      ? (data.cost ?? 0)
      : 0
  },
  onVillainDefeated: (state, villain) => {
    const data = state.cards[villain.cardId]
    if (data.hero) {
      state.discard.push(villain)
      gainVillainAsHero(state, villain, { attack: data.attack, recruit: data.recruit, cost: data.cost })
    } else state.defeated.push(villain)
  },
  onVillainEscaped: (state, villain) => {
    const data = state.cards[villain.cardId]
    if (data.hero || data.villainGroup === 'Khonshu Guardians') {
      state.counters['Khonshu Guardians Escaped'] = (state.counters['Khonshu Guardians Escaped'] ?? 0) + 1
    }
  },
  onTwist: async (_state, _twistNumber, ui) => {
    await playTopVillainCard(_state, ui)
    await playTopVillainCard(_state, ui)
  },
  checkLoss: (state) => (state.counters['Khonshu Guardians Escaped'] ?? 0) >= 7,
}

const SINISTER_AMBITIONS: SchemeDef = {
  id: 'secret_wars_2_sinister_ambitions',
  name: 'Sinister Ambitions',
  img: '',
  twistCount: 6,
  keepsTwistCard: true,
  ambitionCards: 10,
  text:
    'Setup: 6 Twists. Add 10 random Ambition cards to the Villain Deck.\n' +
    'Special Rules: Ambitions are Villains with their printed Attack, +1 Attack for each Twist stacked next to this Scheme, and 4 VP. When an Ambition escapes, resolve its effect.\n' +
    'Twists 1-5: Stack this Twist next to the Scheme. Play another card from the Villain Deck.\n' +
    'Twist 6: Each Ambition Villain in the city escapes.\nEvil Wins: When 4 Ambition Villains escape.',
  villainStrengthModifier: (state, instance) =>
    state.cards[instance.cardId].kind === 'ambition' ? (state.schemeTwists?.length ?? 0) : 0,
  onTwist: async (state, twistNumber, ui, twist) => {
    if (twistNumber <= 5) {
      state.schemeTwists = [...(state.schemeTwists ?? []), twist]
      await playTopVillainCard(state, ui)
      return
    }
    const ambitions = state.city.filter((card): card is CardInstance => !!card && state.cards[card.cardId].kind === 'ambition')
    for (const ambition of ambitions) {
      const index = state.city.findIndex((card) => card?.instanceId === ambition.instanceId)
      if (index !== -1) {
        state.city[index] = null
        await escapeVillain(state, ambition, ui)
      }
    }
  },
  onVillainEscaped: async (state, villain) => {
    if (state.cards[villain.cardId].kind !== 'ambition') return
    state.counters['Ambitions Escaped'] = (state.counters['Ambitions Escaped'] ?? 0) + 1
  },
  checkLoss: (state) => (state.counters['Ambitions Escaped'] ?? 0) >= 4,
}

export const SECRET_WARS_VOL_2_SCHEMES: SchemeDef[] = [
  SECRET_WARS,
  DEADLANDS_HORDES_CHARGE_THE_WALL,
  MASTER_THE_MYSTERIES_OF_KUNG_FU,
  THE_FOUNTAIN_OF_ETERNAL_LIFE,
  ENTHRONE_THE_BARONS_OF_BATTLEWORLD,
  THE_GOD_EMPEROR_OF_BATTLEWORLD,
  THE_MARK_OF_KHONSHU,
  SINISTER_AMBITIONS,
]
