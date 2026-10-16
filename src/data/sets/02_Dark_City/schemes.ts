import type { GameState, SchemeDef } from '../../../engine/types'
import { revealCards, koCard } from '../../../engine/keywords'
import { peekTopCard } from '../../../engine/deckOps'
import { shuffle } from '../../../engine/random'
import { logEvent } from '../../../engine/common'
import { playTopVillainCard, checkEndConditions, enterCity } from '../../../engine/villainPhase'

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
      logEvent(state, `Ucieka: ${state.cards[goon.cardId].name}`)

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

  // Zwykła ucieczka Gooną z końca miasta (ucieczki z Twista liczy onTwist)
  onVillainEscaped: (state, villain) => {
    if (villain.cardId === MAGGIA_GOONS_ID) addGoonEscape(state)
  },

  checkLoss: (state) => (state.counters['goonsEscaped'] ?? 0) >= 5,
}

export const DARK_CITY_SCHEMES: SchemeDef[] = [
  MASSIVE_EARTHQUAKE_GENERATOR,
  ORGANIZED_CRIME_WAVE,
]