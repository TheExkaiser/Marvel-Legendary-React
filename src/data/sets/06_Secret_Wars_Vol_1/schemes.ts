import type { CardInstance, GameState, SchemeDef } from '../../../engine/types'
import { enterCity, escapeVillain, resolveMasterStrike } from '../../../engine/villainPhase'
import { buildDeck } from '../../../engine/deck'
import { shuffle } from '../../../engine/random'
import { logEvent } from '../../../engine/common'

const isSidekick = (state: GameState, card: CardInstance): boolean => card.cardId === state.sidekickCardId

const CRUSH_THEM_WITH_MY_BARE_HANDS: SchemeDef = {
  id: 'secret_wars_crush_them_with_my_bare_hands',
  name: 'Crush Them With My Bare Hands',
  img: '',
  twistCount: 5,
  extraVillainGroups: 1, // "if playing solo": gra jest zawsze solo
  keepsTwistCard: true, // kartę odkłada do KO resolveMasterStrike
  trackMasterStrikes: true,
  text:
    'Setup: 5 Twists. If playing solo, add an extra Villain Group.\n' +
    'Twist: This Twist becomes a Master Strike that takes effect immediately.\n' +
    'Evil Wins: When 8 Master Strikes have taken effect.',
  onTwist: async (state, _twistNumber, ui, twist) => {
    await resolveMasterStrike(state, twist, ui)
  },
  checkLoss: (state) => (state.masterStrikesResolved ?? 0) >= 8,
}

const CORRUPT_THE_NEXT_GENERATION_OF_HEROES: SchemeDef = {
  id: 'secret_wars_corrupt_the_next_generation_of_heroes',
  name: 'Corrupt the Next Generation of Heroes',
  img: '',
  twistCount: 8,
  keepsTwistCard: true,
  text:
    'Setup: 8 Twists. Add 10 Sidekicks to the Villain Deck.\n' +
    'Special Rules: Sidekicks in the Villain Deck and city are Villains. Their Attack is 2 plus the number of Twists stacked next to this Scheme. When you defeat a Sidekick, gain it to the top of your deck.\n' +
    'Twists 1-7: Each player returns a Sidekick from their discard pile to the Sidekick Stack. Then, two Sidekicks from the Sidekick Stack enter the city.\n' +
    'Twist 8: All Sidekicks in the city escape.\n' +
    'Evil Wins: When 4 Sidekicks escape.',
  setup: (state) => {
    const sidekicks = state.sidekickStack.splice(Math.max(0, state.sidekickStack.length - 10))
    state.villainDeck = shuffle([...state.villainDeck, ...sidekicks])
    state.counters['Sidekicks Escaped'] = 0
  },
  villainBaseStrengthOverride: (state, instance) =>
    isSidekick(state, instance) ? 2 + (state.schemeTwists?.length ?? 0) : undefined,
  onVillainDefeated: (state, villain) => {
    if (isSidekick(state, villain)) state.deck.push(villain) // wierzch talii to koniec tablicy
    else state.defeated.push(villain)
  },
  onVillainEscaped: (state, villain) => {
    if (isSidekick(state, villain)) state.counters['Sidekicks Escaped'] = (state.counters['Sidekicks Escaped'] ?? 0) + 1
  },
  onTwist: async (state, twistNumber, ui, twist) => {
    state.schemeTwists = [...(state.schemeTwists ?? []), twist]
    if (twistNumber <= 7) {
      const index = state.discard.findIndex((card) => isSidekick(state, card))
      if (index !== -1) state.sidekickStack.push(...state.discard.splice(index, 1))
      for (let i = 0; i < 2; i++) {
        const sidekick = state.sidekickStack.pop()
        if (sidekick) await enterCity(state, sidekick, ui)
      }
      return
    }
    for (let i = 0; i < state.city.length; i++) {
      const sidekick = state.city[i]
      if (!sidekick || !isSidekick(state, sidekick)) continue
      state.city[i] = null
      await escapeVillain(state, sidekick, ui)
    }
  },
  checkLoss: (state) => (state.counters['Sidekicks Escaped'] ?? 0) >= 4,
}

const BUILD_AN_ARMY_OF_ANNIHILATION: SchemeDef = {
  id: 'secret_wars_build_an_army_of_annihilation',
  name: 'Build an Army of Annihilation',
  img: '',
  twistCount: 9,
  extraHenchmenGroups: 1, // ostatnia wybrana grupa henchmenów to "Annihilation Wave"
  keepsTwistCard: true,
  text:
    'Setup: 9 Twists. Put 10 extra Annihilation Wave Henchmen in that KO pile.\n' +
    'Twist: KO all Annihilation Henchmen from the players\' Victory Piles. Stack this Twist next to the Scheme. Then, for each Twist in that stack, put an Annihilation Henchman from the KO pile next to the Mastermind. Players can fight those Henchmen.\n' +
    'Evil Wins: When there are 10 Annihilation Henchmen next to the Mastermind.',
  setup: (state) => {
    const ids = new Set(state.extraHenchmenCardIds ?? [])
    state.ko.push(...state.villainDeck.filter((card) => ids.has(card.cardId)))
    state.villainDeck = state.villainDeck.filter((card) => !ids.has(card.cardId))
    state.mastermindHenchmen = []
    state.counters['Annihilation Henchmen'] = 0
  },
  onTwist: async (state, _twistNumber, _ui, twist) => {
    const ids = new Set(state.extraHenchmenCardIds ?? [])
    state.ko.push(...state.defeated.filter((card) => ids.has(card.cardId)))
    state.defeated = state.defeated.filter((card) => !ids.has(card.cardId))
    state.schemeTwists = [...(state.schemeTwists ?? []), twist]

    const nextToMastermind = state.mastermindHenchmen ?? []
    for (let i = 0; i < state.schemeTwists.length; i++) {
      const index = state.ko.findIndex((card) => ids.has(card.cardId))
      if (index === -1) break
      nextToMastermind.push(...state.ko.splice(index, 1))
    }
    state.mastermindHenchmen = nextToMastermind
    state.counters['Annihilation Henchmen'] = nextToMastermind.length
  },
  afterVillainDefeated: (state) => {
    state.counters['Annihilation Henchmen'] = state.mastermindHenchmen?.length ?? 0
  },
  checkLoss: (state) => (state.mastermindHenchmen?.length ?? 0) >= 10,
}

const TYRANT_VILLAINS = 'Tyrant Villains'
const isTyrant = (state: GameState, card: CardInstance): boolean => state.cards[card.cardId].villainGroup === TYRANT_VILLAINS
const darkPowerCount = (state: GameState, card: CardInstance): number =>
  (state.captives[card.instanceId] ?? []).filter((captive) => state.cards[captive.cardId].kind === 'twist').length

const MASTER_OF_TYRANTS: SchemeDef = {
  id: 'secret_wars_master_of_tyrants',
  name: 'Master of Tyrants',
  img: '',
  twistCount: 8,
  extraMasterminds: 3, // 3 losowych innych Mastermindów
  keepsTwistCard: true,
  text:
    'Setup: 8 Twists. Choose 3 other Masterminds, and shuffle their 12 Tactics into the Villain Deck. Those Tactics are "Tyrant Villains" with their printed Attack and no abilities.\n' +
    'Twist 1-7: Put this Twist under a Tyrant Villain as "Dark Power." It gets +2 Attack.\n' +
    'Twist 8: All Tyrant Villains in the city escape.\n' +
    'Evil Wins: When 5 Tyrant Villains escape.',
  setup: (state) => {
    const tyrants: CardInstance[] = []
    for (const mastermind of state.extraMasterminds ?? []) {
      for (const tactic of mastermind.tactics) {
        // Nowe id, więc Tyrant nie dziedziczy zdolności Tactic; Attack = Attack jego Mastermina
        const id = `tyrant-${tactic.id}`
        state.cards[id] = {
          ...state.cards[tactic.id],
          id,
          kind: undefined,
          strength: mastermind.card.strength,
          villainGroup: TYRANT_VILLAINS,
          text: undefined,
          keywords: [],
        }
        tyrants.push(...buildDeck([{ card: state.cards[id], count: 1 }]))
      }
    }
    state.villainDeck = shuffle([...state.villainDeck, ...tyrants])
    state.counters['Tyrant Villains Escaped'] = 0
  },
  onTwist: async (state, twistNumber, ui, twist) => {
    if (twistNumber >= 8) {
      state.ko.push(twist)
      for (let i = 0; i < state.city.length; i++) {
        const tyrant = state.city[i]
        if (!tyrant || !isTyrant(state, tyrant)) continue
        state.city[i] = null
        await escapeVillain(state, tyrant, ui)
      }
      return
    }
    const tyrants = state.city.filter((card): card is CardInstance => !!card && isTyrant(state, card))
    const target =
      tyrants.length <= 1
        ? tyrants[0]
        : await ui.choose(tyrants, { prompt: 'Master of Tyrants: put this Twist under a Tyrant Villain as Dark Power', optional: false })
    if (!target) {
      state.ko.push(twist) // brak Tyranta w mieście: Twist nie ma pod kogo trafić
      return
    }
    state.captives[target.instanceId] = [...(state.captives[target.instanceId] ?? []), twist]
  },
  villainStrengthModifier: (state, instance) => (isTyrant(state, instance) ? 2 * darkPowerCount(state, instance) : 0),
  // Dark Power nie jest jeńcem do uratowania: po pokonaniu Tyranta Twisty idą do KO
  onCaptivesRescued: (state, _villain, captives) => {
    state.ko.push(...captives.filter((card) => state.cards[card.cardId].kind === 'twist'))
    return captives.filter((card) => state.cards[card.cardId].kind !== 'twist')
  },
  onVillainEscaped: (state, villain) => {
    if (isTyrant(state, villain)) state.counters['Tyrant Villains Escaped'] = (state.counters['Tyrant Villains Escaped'] ?? 0) + 1
  },
  checkLoss: (state) => (state.counters['Tyrant Villains Escaped'] ?? 0) >= 5,
}

const DARK_ALLIANCE: SchemeDef = {
  id: 'secret_wars_dark_alliance',
  name: 'Dark Alliance',
  img: '',
  twistCount: 8,
  extraMasterminds: 1, // losowy drugi Mastermind
  text:
    'Setup: 8 Twists.\n' +
    'Twist 1: Add a random second Mastermind to the game with one Mastermind Tactic.\n' +
    'Twists 2-4: If the second Mastermind is still in play, it gains another Mastermind Tactic.\n' +
    'Twists 5-6: Each Mastermind captures a Bystander.\n' +
    'Twist 7: Evil Wins!',
  onTwist: async (state, twistNumber, ui) => {
    const second = state.extraMasterminds?.[0]
    const stillInPlay = (id: string) =>
      !!state.masterminds?.some((card) => card.instanceId === id) && !(state.defeatedMastermindIds ?? []).includes(id)

    if (twistNumber === 1) {
      if (!second) return
      const mastermind: CardInstance = { instanceId: second.card.id, cardId: second.card.id }
      const [first, ...rest] = shuffle(second.tactics.map((tactic) => ({ instanceId: tactic.id, cardId: tactic.id })))
      state.masterminds = [...(state.masterminds ?? [state.mastermind]), mastermind]
      state.mastermindStrikeIds = { ...state.mastermindStrikeIds, [mastermind.instanceId]: second.masterStrikeId }
      state.mastermindTactics = { ...state.mastermindTactics, [mastermind.instanceId]: first ? [first] : [] }
      state.mastermindTacticReserve = { ...state.mastermindTacticReserve, [mastermind.instanceId]: rest }
      logEvent(state, `Dark Alliance: ${second.card.name} joins the game`)
      await ui.revealCard(mastermind, 'Dark Alliance: a second Mastermind joins the game')
    } else if (twistNumber <= 4) {
      if (!second || !stillInPlay(second.card.id)) return
      const next = state.mastermindTacticReserve?.[second.card.id]?.shift()
      if (next) {
        state.mastermindTactics = {
          ...state.mastermindTactics,
          [second.card.id]: [...(state.mastermindTactics?.[second.card.id] ?? []), next],
        }
        logEvent(state, `Dark Alliance: ${second.card.name} gains another Mastermind Tactic`)
      }
    } else if (twistNumber <= 6) {
      for (const mastermind of state.masterminds ?? [state.mastermind]) {
        if ((state.defeatedMastermindIds ?? []).includes(mastermind.instanceId)) continue
        const bystander = state.bystanders.pop()
        if (!bystander) break
        state.captives[mastermind.instanceId] = [...(state.captives[mastermind.instanceId] ?? []), bystander]
        await ui.showCapture(mastermind, bystander, `Bystander captured by ${state.cards[mastermind.cardId].name}`)
      }
    }
  },
  checkLoss: (state) => state.twistsRevealed >= 7,
}

export const SECRET_WARS_VOL_1_SCHEMES: SchemeDef[] = [
  CRUSH_THEM_WITH_MY_BARE_HANDS,
  CORRUPT_THE_NEXT_GENERATION_OF_HEROES,
  BUILD_AN_ARMY_OF_ANNIHILATION,
  MASTER_OF_TYRANTS,
  DARK_ALLIANCE,
]
