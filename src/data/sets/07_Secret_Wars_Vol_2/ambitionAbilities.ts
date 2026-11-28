import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'
import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { escapeVillain } from '../../../engine/villainPhase'
import { chargeVillain } from '../../../engine/charge'
import { discardCard } from '../../../engine/keywords'
import { gainWound } from '../../../engine/wounds'
import { resolveMasterStrike, resolveTwist } from '../../../engine/villainPhase'

const id = (name: string) => `secret-wars-2-ambition-${name}`
const ambitionEscape = (name: string, effect: (state: GameState, ui: UiAdapter, self: CardInstance) => Promise<void>) =>
  registerVillainAbilities(id(name), { onEscape: effect })

ambitionEscape('seize-the-high-ground', async (state) => {
  state.enemyAttackModifierThisTurn = (state.enemyAttackModifierThisTurn ?? 0) + 1
})

ambitionEscape('detonate-the-bridge', async (state, ui) => {
  await gainWound(state, ui)
})

ambitionEscape('secret-escape-tunnels', async (state, ui) => {
  const index = state.city.findIndex((card) => card !== null)
  if (index === -1) return
  const villain = state.city[index]
  if (!villain) return
  state.city[index] = null
  await escapeVillain(state, villain, ui)
})

ambitionEscape('crazed-charge', async (state, ui) => {
  const villain = state.city.find((card) => card !== null)
  if (villain) await chargeVillain(state, ui, villain, 2)
})

ambitionEscape('devastate-shield', async (state, ui) => {
  for (const card of [...state.hand]) {
    if ((state.cards[card.cardId].cost ?? 0) === 0) await discardCard(state, card.instanceId, ui)
  }
})

ambitionEscape('rack-and-ruin', async (state, ui, self) => {
  await resolveMasterStrike(state, self, ui)
  await resolveTwist(state, self, ui)
})

// The remaining Ambitions are deliberately represented by their printed text
// and remain safe no-ops until their player-choice UI is added.
