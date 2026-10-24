import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { gainWound } from '../../../engine/game'
import { revealCards, haveCards, koCard } from '../../../engine/keywords'
import { refillHq } from '../../../engine/recruit'
import { escapeVillain } from '../../../engine/villainPhase'
import { isCityDestroyed } from '../../../engine/cityLayout'
import { CITY_NAMES } from '../../../engine/constants'
import { getCardData } from '../../../engine/cardData'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'
import { chooseOneCard } from '../../../engine/abilityHelpers'

// Cosmic Threat (jedna klasa) działa jako stały modyfikator siły: keywords.ts, cosmicThreatReduction.

/** Bohaterowie w HQ (bez Bystanderów, którzy mogą tam leżeć w Save Humanity). */
function hqHeroes(state: GameState): CardInstance[] {
  return state.hq.filter((c): c is CardInstance => !!c && getCardData(state, c).hero !== undefined)
}

async function captureBystanders(
  state: GameState,
  ui: UiAdapter,
  captor: CardInstance,
  count: number,
): Promise<void> {
  for (let i = 0; i < count; i++) {
    const bystander = state.bystanders.pop()
    if (!bystander) return
    state.captives[captor.instanceId] = [...(state.captives[captor.instanceId] ?? []), bystander]
    await ui.showCapture(captor, bystander, `Bystander captured by ${state.cards[captor.cardId].name}`)
  }
}

// Burrow: "Fight: If the Streets were empty, put this Villain back into the Streets."
// Tu tylko zaznaczamy zamiar. Odłożenie robi combat.ts (removeVillainFromCity), po rozpatrzeniu bonusów za pokonanie.
// Gdy Streets są zniszczone, Burrow nic nie robi.
function markBurrow(state: GameState, villain: CardInstance): void {
  const streets = CITY_NAMES.indexOf('Streets')
  if (isCityDestroyed(state, streets)) return
  if (state.city[streets] === null) state.burrowingVillainId = villain.instanceId
}

// ---------- Heralds of Galactus ----------

async function firelordEffect(state: GameState, ui: UiAdapter): Promise<void> {
  const ranged = revealCards(state, { type: 'ranged' })
  if (ranged.length > 0) {
    await ui.showInfo(ranged[0], 'Firelord: revealed a Ranged Hero')
    return
  }
  await gainWound(state, ui)
}

registerVillainAbilities('villain-firelord', {
  onFight: firelordEffect,
  onEscape: firelordEffect,
})

registerVillainAbilities('villain-morg', {
  onAmbush: async (state) => {
    for (let i = 0; i < state.hq.length; i++) {
      const card = state.hq[i]
      if (!card) continue
      const data = getCardData(state, card)
      if (!data.hero || (data.type ?? []).includes('instinct')) continue
      state.hq[i] = null
      state.heroDeck.unshift(card) // spód talii = początek tablicy
    }
    refillHq(state)
  },
})

// Siódma karta w nowej ręce: ten sam mechanizm co Electromagnetic Bubble (extraCardToHand), jedna karta na turę
registerVillainAbilities('villain-stardust', {
  onFight: async (state, ui) => {
    const covertHeroes = haveCards(state, { type: 'covert' }).filter((c) => !!state.cards[c.cardId].hero)
    if (covertHeroes.length === 0) return

    const chosen = await ui.choose(covertHeroes, {
      prompt: 'Stardust: choose a Covert Hero to add to your next hand as a seventh card',
      optional: false,
    })
    if (chosen) state.extraCardToHand = chosen.instanceId
  },
})

registerVillainAbilities('villain-terrax-the-tamer', {
  onAmbush: async (state, ui, self) => {
    const strengthHeroes = hqHeroes(state).filter((c) => (getCardData(state, c).type ?? []).includes('strength'))
    await captureBystanders(state, ui, self, strengthHeroes.length)
  },
})

// ---------- Subterranea ----------

registerVillainAbilities('villain-giganto', {
  onFight: async (state, _ui, self) => {
    state.bonusDrawNextTurn += 2
    markBurrow(state, self)
  },
})

registerVillainAbilities('villain-megataur', {
  onAmbush: async (state, ui, self) => {
    await captureBystanders(state, ui, self, 2)
  },
  onFight: async (state, _ui, self) => {
    markBurrow(state, self)
  },
})

registerVillainAbilities('villain-moloids', {
  onFight: async (state, ui, self) => {
    const heroes = haveCards(state).filter((c) => state.cards[c.cardId].hero !== undefined)
    if (heroes.length > 0) {
      const chosen = await chooseOneCard(ui, heroes, 'Moloids (Fight): KO one of your Heroes')
      if (chosen) koCard(state, chosen.instanceId)
    }
    markBurrow(state, self)
  },
})

// Ra'ktar: Villain ze Streets idzie na Bridge i wypycha stamtąd drugiego. Jeśli któreś z pól jest zniszczone, nic się nie dzieje
registerVillainAbilities('villain-raktar-the-molan-king', {
  onAmbush: async (state, ui) => {
    const streets = CITY_NAMES.indexOf('Streets')
    const bridge = CITY_NAMES.indexOf('Bridge')
    if (isCityDestroyed(state, streets) || isCityDestroyed(state, bridge)) return

    const mover = state.city[streets]
    if (!mover) return

    const pushed = state.city[bridge]
    state.city[bridge] = mover
    state.city[streets] = null
    if (pushed) await escapeVillain(state, pushed, ui)
  },
  onFight: async (state, _ui, self) => {
    markBurrow(state, self)
  },
})
