import type { CardData, CardInstance, GameState, SchemeDef } from '../../../engine/types'
import { revealCards, koCard } from '../../../engine/keywords'
import { peekTopCard } from '../../../engine/deckOps'
import { shuffle } from '../../../engine/random'
import { logEvent } from '../../../engine/common'
import { escapeVillain, playTopVillainCard, checkEndConditions } from '../../../engine/villainPhase'
import { withPrefixedImg } from '../../../engine/setup'

// ---------- Massive Earthquake Generator ----------

const MASSIVE_EARTHQUAKE_GENERATOR: SchemeDef = {
  id: 'darkcity_massive_earthquake_generator',
  name: 'Massive Earthquake Generator',
  img: '',
  twistCount: 8,
  text:
    'Setup: 8 Twists.\n' +
    'Twist: Each player reveals a strength Hero or KOs the top card of their deck.\n' +
    'Evil Wins: When the number of non grey Heroes in the KO pile is 3 times the number of players.',

  onTwist: async (state, n, ui) => {
    const strengthToReveal = revealCards(state, { type: 'strength' })

    if (strengthToReveal.length > 0) {
      const chosen =
        strengthToReveal.length === 1
          ? strengthToReveal[0]
          : await ui.choose(strengthToReveal, {
              prompt: 'Massive Earthquake Generator (Twist): reveal a strength Hero or KO the top card of your deck',
              optional: false,
            })
      if (chosen) {
        await ui.showInfo(chosen, 'Massive Earthquake Generator (Twist): revealed a strength Hero')
        return
      }
    }

    const top = peekTopCard(state)
    if (!top) return
    await ui.showInfo(top, 'Massive Earthquake Generator (Twist): KO the top card of your deck')
    koCard(state, top.instanceId)
  },

  // Gra solo: 3 x liczba graczy (1) = 3. Karta bez pola type jest szara.
  checkLoss: (state) =>
    state.ko.filter((c) => (state.cards[c.cardId].type?.length ?? 0) > 0).length >= 3,
}

// ---------- Organized Crime Wave ----------

const MAGGIA_GOONS_ID = 'henchmen-maggia-goons'

function addGoonEscape(state: GameState): void {
  state.counters['goonsEscaped'] = (state.counters['goonsEscaped'] ?? 0) + 1
}

const ORGANIZED_CRIME_WAVE: SchemeDef = {
  id: 'darkcity_organized_crime_wave',
  name: 'Organized Crime Wave',
  img: '',
  twistCount: 8,
  text:
    'Setup: 8 Twists. Include 10 Maggia Goons as one of the Henchman Groups.\n' +
    'Special Rules: Goons also have the ability "Ambush: Play another card from the Villain Deck."\n' +
    "Twist: Each Goon in the city escapes. Shuffle all Goons from each players' Victory Piles into the Villain Deck.\n" +
    'Evil Wins: When 5 Goons escape.',

  setupRules: {
    requiredHenchmenGroups: ['darkcity_maggia_goons'],
  },

  onTwist: async (state) => {
    // Każdy Goon w mieście ucieka (miejsce zostaje puste, reszta się nie przesuwa)
    for (let i = 0; i < state.city.length; i++) {
      const goon = state.city[i]
      if (!goon || goon.cardId !== MAGGIA_GOONS_ID) continue

      state.city[i] = null
      state.escaped.push(goon)
      logEvent(state, `Escaped: ${state.cards[goon.cardId].name}`)

      const lost = state.captives[goon.instanceId] ?? []
      state.ko.push(...lost)
      delete state.captives[goon.instanceId]

      addGoonEscape(state)
    }

    // Goony ze stosu Victory wracają do talii złoczyńców
    const goonsInVictory = state.defeated.filter((c) => c.cardId === MAGGIA_GOONS_ID)
    state.defeated = state.defeated.filter((c) => c.cardId !== MAGGIA_GOONS_ID)
    state.villainDeck = shuffle([...state.villainDeck, ...goonsInVictory])
  },

  // Zwykła ucieczka Goona z końca miasta (ucieczki z Twista liczy onTwist)
  onVillainEscaped: (state, villain) => {
    if (villain.cardId === MAGGIA_GOONS_ID) addGoonEscape(state)
  },

  checkLoss: (state) => (state.counters['goonsEscaped'] ?? 0) >= 5,
}

// ---------- Transform Citizens Into Demons ----------

const GOBLIN_QUEEN_HERO = 'Jean Grey'

const TRANSFORM_CITIZENS_INTO_DEMONS: SchemeDef = {
  id: 'darkcity_transform_citizens_into_demons',
  name: 'Transform Citizens Into Demons',
  img: '',
  twistCount: 8,
  text:
    'Setup: 8 Twists. Villain Deck includes 14 extra Jean Grey cards and no Bystanders.\n' +
    'Twist: Stack 5 Bystanders face down next to the Scheme. Bystanders stacked here are "Demon Goblin" Villains. They have 2 Attack. Players can fight these Demon Goblins to rescue them as Bystanders.\n' +
    'Special Rules: Each Jean Grey card counts as a "Goblin Queen" Villain. It\'s worth 4 VP. It has Attack equal to its Cost plus the number of Demon Goblins stacked next to the Scheme.\n' +
    'Evil Wins: When 4 Goblin Queen cards escape.',

  setupRules: {
    bystandersInVillainDeck: 0,
    villainDeckHeroes: 1,
    requiredVillainDeckHeroes: ['darkcity_jean_grey'],
  },

  setup: (state) => {
    state.demonGoblins = []
    // Goblin Queen jest warta 4 VP (kopie wpisów, bez ruszania singletonów z cards.ts)
    for (const id of Object.keys(state.cards)) {
      if (state.cards[id].hero === GOBLIN_QUEEN_HERO) state.cards[id] = { ...state.cards[id], vp: 4 }
    }
  },

  villainBaseStrengthOverride: (state, instance) => {
    const data = state.cards[instance.cardId]
    if (data.hero !== GOBLIN_QUEEN_HERO) return undefined
    return (data.cost ?? 0) + (state.demonGoblins?.length ?? 0)
  },

  onTwist: async (state) => {
    const stack = state.demonGoblins ?? (state.demonGoblins = [])
    for (let i = 0; i < 5; i++) {
      const bystander = state.bystanders.pop()
      if (!bystander) break
      stack.push(bystander)
    }
  },

  onVillainEscaped: (state, villain) => {
    if (state.cards[villain.cardId].hero !== GOBLIN_QUEEN_HERO) return
    state.counters['goblinQueensEscaped'] = (state.counters['goblinQueensEscaped'] ?? 0) + 1
  },

  checkLoss: (state) => (state.counters['goblinQueensEscaped'] ?? 0) >= 4,
}

// ---------- Steal the Weaponized Plutonium ----------

const isPlutonium = (state: GameState, c: CardInstance): boolean => state.cards[c.cardId].kind === 'twist'

const STEAL_THE_WEAPONIZED_PLUTONIUM: SchemeDef = {
  id: 'darkcity_steal_the_weaponized_plutonium',
  name: 'Steal the Weaponized Plutonium',
  img: '',
  twistCount: 8,
  keepsTwistCard: true,
  text:
    'Setup: 8 Twists representing Plutonium. Add an extra Villain Group.\n' +
    'Twist: This Plutonium is captured by the closest Villain to the Villain Deck. If there are no Villains in the city, KO this Plutonium. Either way, play another card from the Villain Deck.\n' +
    'Special Rules: Each Villain gets +1 Attack for each Plutonium it has. When a Villain with any Plutonium is defeated, shuffle that Plutonium back into the Villain Deck.\n' +
    'Evil Wins: When 4 Plutonium have been carried off by Villains.',

  setupRules: {
    villainGroups: 2,
  },

  villainStrengthModifier: (state, instance) =>
    (state.captives[instance.instanceId] ?? []).filter((c) => isPlutonium(state, c)).length,

  onTwist: async (state, n, ui, twist) => {
    // Najbliższy talii złoczyńców = najwyższy indeks w mieście (tak samo jak przy łapaniu Bystanderów)
    let carrier: CardInstance | null = null
    for (let i = state.city.length - 1; i >= 0 && !carrier; i--) carrier = state.city[i]

    if (carrier) {
      state.captives[carrier.instanceId] = [...(state.captives[carrier.instanceId] ?? []), twist]
      await ui.showCapture(carrier, twist, `Plutonium captured by ${state.cards[carrier.cardId].name}`)
    } else {
      state.ko.push(twist)
    }

    await playTopVillainCard(state, ui)
    checkEndConditions(state)
  },

  onCaptivesRescued: (state, _villain, captives) => {
    const plutonium = captives.filter((c) => isPlutonium(state, c))
    if (plutonium.length > 0) state.villainDeck = shuffle([...state.villainDeck, ...plutonium])
    return captives.filter((c) => !isPlutonium(state, c))
  },

  onVillainEscaped: (state, _villain, lostCaptives) => {
    const carried = lostCaptives.filter((c) => isPlutonium(state, c)).length
    state.counters['plutoniumCarriedOff'] = (state.counters['plutoniumCarriedOff'] ?? 0) + carried
  },

  checkLoss: (state) => (state.counters['plutoniumCarriedOff'] ?? 0) >= 4,
}

// ---------- Capture Baby Hope ----------

// Obrazek tokenu dziecka: ścieżka względem folderu public/ (np. 'tokens/baby-hope.png').
// Pusty napis = token wyświetla się jako tekst.
const BABY_HOPE_IMG = ''

const BABY_HOPE_CARD: CardData = {
  id: 'token-baby-hope',
  name: 'Baby Hope',
  img: BABY_HOPE_IMG,
  kind: 'token',
  vp: 6,
  text: 'Hope Summers. Worth 6 VP at the end of the game.',
}

// Jedna, stała instancja tokenu (w grze jest tylko jedno dziecko)
const BABY: CardInstance = { instanceId: BABY_HOPE_CARD.id, cardId: BABY_HOPE_CARD.id }

const TWISTS_AT_MASTERMIND = 'Twists next to Mastermind'

const carriesBaby = (state: GameState, villain: CardInstance): boolean =>
  (state.captives[villain.instanceId] ?? []).some((c) => c.instanceId === BABY.instanceId)

/** Dziecko leży na scheme'ie (zdejmuje je z Victory Pool, jeśli tam było). */
function returnBabyToScheme(state: GameState): void {
  state.defeated = state.defeated.filter((c) => c.instanceId !== BABY.instanceId)
  const tokens = state.schemeTokens ?? []
  if (!tokens.some((t) => t.instanceId === BABY.instanceId)) state.schemeTokens = [...tokens, BABY]
}

const CAPTURE_BABY_HOPE: SchemeDef = {
  id: 'darkcity_capture_baby_hope',
  name: 'Capture Baby Hope',
  img: '',
  twistCount: 8,
  text:
    'Setup: 8 Twists. Put a token on this Scheme to represent the baby, Hope Summers.\n' +
    'Twist: If a Villain has the baby, that Villain escapes. Otherwise, the baby is captured by the closest Villain to the Villain Deck. (If there are no Villains, do nothing.)\n' +
    'Special Rules: The Villain with the baby gets +4 Attack. If you defeat that Villain, rescue the baby to your Victory Pile (until the next Twist). The baby is worth 6 VP at the end of the game. If a Villain escapes with the baby, stack a Twist next to the Mastermind and return the baby to this Scheme card.\n' +
    'Evil Wins: When there are 3 Twists stacked next to the Mastermind.',

  setup: (state) => {
    state.cards[BABY_HOPE_CARD.id] = withPrefixedImg(BABY_HOPE_CARD)
    state.schemeTokens = [BABY]
    state.counters[TWISTS_AT_MASTERMIND] = 0
  },

  villainStrengthModifier: (state, instance) => (carriesBaby(state, instance) ? 4 : 0),

  onTwist: async (state, n, ui) => {
    // Villain z dzieckiem ucieka
    const carrier = state.city.find((c): c is CardInstance => !!c && carriesBaby(state, c))
    if (carrier) {
      state.city[state.city.findIndex((c) => c?.instanceId === carrier.instanceId)] = null
      await escapeVillain(state, carrier, ui)
      return
    }

    // Inaczej: dziecko (ze scheme'u albo z Victory Pool) łapie najbliższy talii Villain
    returnBabyToScheme(state)
    let closest: CardInstance | null = null
    for (let i = state.city.length - 1; i >= 0 && !closest; i--) closest = state.city[i]
    if (!closest) return

    state.schemeTokens = (state.schemeTokens ?? []).filter((t) => t.instanceId !== BABY.instanceId)
    state.captives[closest.instanceId] = [...(state.captives[closest.instanceId] ?? []), BABY]
    await ui.showCapture(closest, BABY, `Baby Hope captured by ${state.cards[closest.cardId].name}`)
  },

  // Pokonanie Villaina z dzieckiem: dziecko do Victory Pool (to nie Bystander, więc bez bonusów "rescue")
  onCaptivesRescued: (state, _villain, captives) => {
    const rest = captives.filter((c) => c.instanceId !== BABY.instanceId)
    if (rest.length !== captives.length) state.defeated.push(BABY)
    return rest
  },

  // Ucieczka z dzieckiem: dziecko nie ginie (silnik wrzucił je do KO), wraca na scheme, Twist idzie obok mastermina
  onVillainEscaped: (state, _villain, lostCaptives) => {
    if (!lostCaptives.some((c) => c.instanceId === BABY.instanceId)) return
    state.ko = state.ko.filter((c) => c.instanceId !== BABY.instanceId)
    returnBabyToScheme(state)
    state.counters[TWISTS_AT_MASTERMIND] = (state.counters[TWISTS_AT_MASTERMIND] ?? 0) + 1
  },

  checkLoss: (state) => (state.counters[TWISTS_AT_MASTERMIND] ?? 0) >= 3,
}

// Wszystkie schematy Dark City. Nowy scheme = nowy obiekt wyżej + wpis tutaj
export const DARK_CITY_SCHEMES: SchemeDef[] = [
  MASSIVE_EARTHQUAKE_GENERATOR,
  ORGANIZED_CRIME_WAVE,
  TRANSFORM_CITIZENS_INTO_DEMONS,
  STEAL_THE_WEAPONIZED_PLUTONIUM,
  CAPTURE_BABY_HOPE,
]
