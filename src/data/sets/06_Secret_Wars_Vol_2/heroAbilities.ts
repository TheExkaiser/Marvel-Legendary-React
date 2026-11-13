import { registerCardAbility } from '../../../engine/cardAbilities'
import { getCardData } from '../../../engine/cardData'
import { logEvent } from '../../../engine/common'
import { drawCards } from '../../../engine/deckOps'
import { patrolCitySpace } from '../../../engine/patrol'
import { addAttack, addRecruit } from '../../../engine/resources'
import { canUseSpectrum } from '../../../engine/spectrum'

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
