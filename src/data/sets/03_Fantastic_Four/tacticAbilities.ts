import { registerCardAbility } from '../../../engine/cardAbilities'
import { drawCards, rescueBystander } from '../../../engine/game'
import { revealCards, koCard } from '../../../engine/keywords'
import { getCardData } from '../../../engine/cardData'
import { chooseHeroClass } from '../../../engine/heroClasses'
import { resolveVillainDeckCard, checkEndConditions } from '../../../engine/villainPhase'
import { shuffle } from '../../../engine/random'
import { isLedGroupVillain } from '../../../engine/ledGroup'
import { isCityDestroyed } from '../../../engine/cityLayout'
import { CITY_NAMES } from '../../../engine/constants'
import type { CardInstance } from '../../../engine/types'

// ---------- Galactus ----------

// "Each player reveals any number of cards of that class": odkrywamy wszystkie (ręka + zagrane), bo więcej = lepiej
registerCardAbility('galactus-cosmic-entity', async (state, { ui }) => {
  const type = await chooseHeroClass(ui, 'Cosmic Entity: wybierz klasę kart')
  if (!type) return
  drawCards(state, revealCards(state, { type }).length)
})

// Dobranie 6 kart dodatkowych to bonusDrawNextTurn, odrzucenie 6 po dobraniu ręki robi endTurn (newHandDiscardCount)
registerCardAbility('galactus-force-of-eternity', async (state) => {
  state.bonusDrawNextTurn += 6
  state.newHandDiscardCount = (state.newHandDiscardCount ?? 0) + 6
})

registerCardAbility('galactus-panicked-mobs', async (state, { ui }) => {
  const type = await chooseHeroClass(ui, 'Panicked Mobs: wybierz klasę kart')
  if (!type) return
  const count = revealCards(state, { type }).length
  for (let i = 0; i < count; i++) await rescueBystander(state, ui)
})

// Solo: "each other player" = gracz
registerCardAbility('galactus-sunder-the-earth', async (state) => {
  const hqNames = new Set(
    state.hq.filter((c): c is CardInstance => !!c).map((c) => state.cards[c.cardId].name),
  )
  const toKo = state.discard.filter((c) => {
    const data = getCardData(state, c)
    return !!data.hero && hqNames.has(data.name)
  })
  for (const card of toKo) koCard(state, card.instanceId)
})

// ---------- Mole Man ----------

// Solo: "each other player" = gracz. Karta idzie do Escaped Villains bez efektu Escape
registerCardAbility('mole-man-dig-to-freedom', async (state, { ui }) => {
  const candidates = state.defeated.filter((c) => isLedGroupVillain(state, c))
  if (candidates.length === 0) return

  const chosen = await ui.choose(candidates, {
    prompt: 'Dig to Freedom: wybierz Villaina z Victory Pile, który trafi do Escaped Villains',
    optional: false,
  })
  if (!chosen) return

  const index = state.defeated.findIndex((c) => c.instanceId === chosen.instanceId)
  if (index === -1) return
  const [card] = state.defeated.splice(index, 1)
  state.escaped.push(card)
  checkEndConditions(state)
})

registerCardAbility('mole-man-master-of-monsters', async (state, { ui }) => {
  if (state.tactics.length === 0) return // to była ostatnia taktyka

  // Wierzch talii złoczyńców = koniec tablicy. Odkryte karty ustawiamy od wierzchu
  const count = Math.min(6, state.villainDeck.length)
  if (count === 0) return
  const revealed = state.villainDeck.splice(state.villainDeck.length - count, count).reverse()

  for (let i = 0; i < revealed.length; i++) {
    await ui.revealCard(revealed[i], `Master of Monsters: odkryto kartę ${i + 1}/${revealed.length}`)
  }

  const toPlay = revealed.filter((c) => isLedGroupVillain(state, c))
  const rest = revealed.filter((c) => !toPlay.includes(c))

  for (const card of toPlay) {
    if (state.status !== 'playing') break
    await resolveVillainDeckCard(state, card, ui)
  }

  // Spód talii = początek tablicy
  state.villainDeck.unshift(...shuffle(rest))
  checkEndConditions(state)
})

// "+6 Attack tylko na Villainów w Streets" = Villainowie w Streets mają -6 Attack w tej turze (jak Dirty Work w Sewers)
registerCardAbility('mole-man-secret-tunnel', async (state) => {
  state.locationAttackModifiers['Streets'] = (state.locationAttackModifiers['Streets'] ?? 0) - 6
})

// "+6 Recruit tylko na Bohaterów z pola HQ pod Streets" = jednorazowa pula 6 Recruit,
// którą można wydać wyłącznie na Bohaterów w tym polu HQ.
// Pole HQ o indeksie i leży pod CITY_NAMES[i]. Gdy Streets są zniszczone, efekt nic nie robi.
registerCardAbility('mole-man-underground-riches', async (state) => {
  if (isCityDestroyed(state, CITY_NAMES.indexOf('Streets'))) return
  state.hqRecruitBonuses = { ...state.hqRecruitBonuses, Streets: (state.hqRecruitBonuses?.Streets ?? 0) + 6 }
})
