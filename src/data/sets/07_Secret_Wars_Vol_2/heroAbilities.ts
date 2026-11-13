import { registerCardAbility } from '../../../engine/cardAbilities'
import { defeatVillainFree } from '../../../engine/combat'
import { CITY_NAMES } from '../../../engine/constants'
import { getCardData } from '../../../engine/cardData'
import { logEvent } from '../../../engine/common'
import { drawCards, revealTopAndDrawIf } from '../../../engine/deckOps'
import { countPlayedThisTurn } from '../../../engine/keywords'
import { emptyAdjacentCityPairs, patrolCitySpace } from '../../../engine/patrol'
import { addAttack, addRecruit } from '../../../engine/resources'
import { canUseSpectrum } from '../../../engine/spectrum'
import { canDefeatVillain } from '../../../engine/villainRequirements'

// ---------- Agent Venom ----------

// Spectrum: +1 Recruit i +1 Attack
registerCardAbility('secret-wars-2-agent-venom-multi-gun', async (state) => {
  if (!canUseSpectrum(state)) return
  addRecruit(state, 1)
  addAttack(state, 1)
})

// Patrol the Bank: puste = +2 Recruit, zajęte = +2 Attack (Wall-Crawl obsługuje recruit.ts)
registerCardAbility('secret-wars-2-agent-venom-government-payroll', async (state) => {
  const patrol = patrolCitySpace(state, 'Bank')
  if (patrol === 'empty') {
    logEvent(state, 'Patrol the Bank: empty')
    addRecruit(state, 2)
  } else if (patrol === 'occupied') {
    logEvent(state, 'Patrol the Bank: not empty')
    addAttack(state, 2)
  }
})

// Patrol the Sewers: puste = dobierz kartę
registerCardAbility('secret-wars-2-agent-venom-big-slimeportunity', async (state) => {
  if (patrolCitySpace(state, 'Sewers') !== 'empty') return
  logEvent(state, 'Patrol the Sewers: empty')
  drawCards(state, 1)
})

// Za każdą INNĄ kartę zagraną w tej turze z ikoną Recruit +1 Recruit, z ikoną Attack +1 Attack
// (karta z obiema ikonami daje oba bonusy). Ikona = drukowana wartość (0+ też ją ma), jak hasIcon w Vol. 1.
// Podczas zdolności ta karta nie jest jeszcze w cardsPlayedThisTurn, więc nie liczy samej siebie.
registerCardAbility('secret-wars-2-agent-venom-shapeshifting-symbiote', async (state) => {
  const played = state.cardsPlayedThisTurn.map((card) => getCardData(state, card))
  const recruit = played.filter((data) => data.recruit !== undefined).length
  const attack = played.filter((data) => data.attack !== undefined).length
  if (recruit > 0) addRecruit(state, recruit)
  if (attack > 0) addAttack(state, attack)
})

// ---------- Arkon the Magnificent ----------

// Patrol the Sewers: puste = +1 Recruit (Wall-Crawl obsługuje recruit.ts)
registerCardAbility('secret-wars-2-arkon-the-magnificent-all-terrain-barbarian', async (state) => {
  if (patrolCitySpace(state, 'Sewers') !== 'empty') return
  logEvent(state, 'Patrol the Sewers: empty')
  addRecruit(state, 1)
})

// Spectrum: dobierz kartę
registerCardAbility('secret-wars-2-arkon-the-magnificent-quiver-of-thunderbolts', async (state) => {
  if (!canUseSpectrum(state)) return
  drawCards(state, 1)
})

// Patrol two adjacent city spaces: jeśli obie są puste, +1 Attack.
// Gracz i tak wybrałby parę pustych pól (nic nie traci), więc wystarczy sprawdzić, czy taka para istnieje.
registerCardAbility('secret-wars-2-arkon-the-magnificent-warlord-of-open-spaces', async (state) => {
  if (emptyAdjacentCityPairs(state).length === 0) return
  logEvent(state, 'Patrol two adjacent city spaces: both empty')
  addAttack(state, 1)
})

// Patrol the Rooftops: puste = +4 Recruit i +4 Attack, zajęte = pokonaj tego Villaina za darmo
registerCardAbility('secret-wars-2-arkon-the-magnificent-lord-of-dragons', async (state, { ui }) => {
  const patrol = patrolCitySpace(state, 'Rooftops')
  if (patrol === 'empty') {
    logEvent(state, 'Patrol the Rooftops: empty')
    addRecruit(state, 4)
    addAttack(state, 4)
    return
  }
  if (patrol !== 'occupied') return
  const villain = state.city[CITY_NAMES.indexOf('Rooftops')]
  if (!villain) return
  logEvent(state, 'Patrol the Rooftops: not empty')
  if (!canDefeatVillain(state, villain.cardId)) return
  await defeatVillainFree(state, villain.instanceId, ui)
})

// ---------- Beast ----------

registerCardAbility('secret-wars-2-beast-balanced-attack', async (state, { ui }) => {
  await revealTopAndDrawIf(
    state,
    ui,
    (card) => {
      const type = state.cards[card.cardId].type ?? []
      return type.includes('tech') || type.includes('strength')
    },
    'Balanced Attack: revealed the top card of your deck',
  )
})

// Patrol any city space: jeśli jest puste, Bohater w HQ pod nim kosztuje 3 mniej w tej turze.
// Gracz wybiera Bohatera z HQ stojącego pod pustym polem miasta (pole HQ o indeksie i leży pod CITY_NAMES[i]).
registerCardAbility('secret-wars-2-beast-upside-down-thinking', async (state, { ui }) => {
  const targets = state.hq.flatMap((card, index) =>
    card && state.cards[card.cardId].hero && patrolCitySpace(state, CITY_NAMES[index]) === 'empty' ? [card] : [],
  )
  if (targets.length === 0) return
  const chosen = await ui.choose(targets, {
    prompt: 'Upside-down Thinking: choose a Hero in the HQ under an empty city space (it costs 3 less this turn)',
    optional: true,
  })
  if (!chosen) return
  state.hqCardCostReductionsThisTurn = {
    ...state.hqCardCostReductionsThisTurn,
    [chosen.instanceId]: (state.hqCardCostReductionsThisTurn?.[chosen.instanceId] ?? 0) + 3,
  }
  logEvent(state, `Upside-down Thinking: ${state.cards[chosen.cardId].name} costs 3 less this turn`)
})

// +1 Attack za każdą inną zagraną kartę strength i osobno +1 za każdą inną zagraną kartę tech (strength + tech daje oba)
registerCardAbility('secret-wars-2-beast-doctor-of-beatdown', async (state) => {
  const bonus = countPlayedThisTurn(state, { type: 'strength' }) + countPlayedThisTurn(state, { type: 'tech' })
  if (bonus > 0) addAttack(state, bonus)
})

// strength, strength, tech, tech: wymaga co najmniej dwóch innych zagranych kart każdego typu (jak Cosmic Energies w Vol. 1)
registerCardAbility('secret-wars-2-beast-multi-variable-smackulus', async (state) => {
  if (countPlayedThisTurn(state, { type: 'strength' }) >= 2 && countPlayedThisTurn(state, { type: 'tech' }) >= 2) {
    drawCards(state, 3)
  }
})
