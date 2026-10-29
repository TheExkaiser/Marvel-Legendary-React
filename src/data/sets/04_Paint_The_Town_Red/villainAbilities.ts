import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { registerStrengthModifier } from '../../../engine/strengthModifiers'
import { addAttack, addRecruit, gainWound } from '../../../engine/game'
import { getCardAbility } from '../../../engine/cardAbilities'
import { chooseOneCard } from '../../../engine/abilityHelpers'
import { discardCard, revealCards } from '../../../engine/keywords'
import { koFromHq, refillHq } from '../../../engine/recruit'
import { CITY_NAMES } from '../../../engine/constants'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'

function captureForVillain(state: GameState, ui: UiAdapter, villain: CardInstance): Promise<void> {
  const bystander = state.bystanders.pop()
  if (!bystander) return Promise.resolve()
  state.captives[villain.instanceId] = [...(state.captives[villain.instanceId] ?? []), bystander]
  return ui.showCapture(villain, bystander, `Bystander captured by ${state.cards[villain.cardId].name}`)
}

function hqHeroUnder(state: GameState, self: CardInstance): CardInstance | undefined {
  const cityIndex = state.city.findIndex((card) => card?.instanceId === self.instanceId)
  return cityIndex === -1 ? undefined : state.hq[cityIndex] ?? undefined
}

function highestCostHqHero(state: GameState): CardInstance | undefined {
  return state.hq
    .filter((card): card is CardInstance => !!card && state.cards[card.cardId].hero !== undefined)
    .sort((a, b) => (state.cards[b.cardId].cost ?? 0) - (state.cards[a.cardId].cost ?? 0))[0]
}

async function revealInstinctOrDiscard(state: GameState, ui: UiAdapter, prompt: string): Promise<void> {
  const instinct = revealCards(state, { type: 'instinct' })
  const revealed = await chooseOneCard(ui, instinct, prompt)
  if (revealed) {
    await ui.showInfo(revealed, `${prompt}: revealed an Instinct Hero`)
    return
  }
  const discarded = await chooseOneCard(ui, state.hand, `${prompt}: discard a card`)
  if (discarded) await discardCard(state, discarded.instanceId, ui)
}

async function revealInstinctOrWound(state: GameState, ui: UiAdapter, prompt: string): Promise<void> {
  const instinct = await chooseOneCard(ui, revealCards(state, { type: 'instinct' }), prompt)
  if (instinct) {
    await ui.showInfo(instinct, `${prompt}: revealed an Instinct Hero`)
    return
  }
  await gainWound(state, ui)
}

// ---------- Maximum Carnage ----------

registerStrengthModifier('villain-doppelganger', (state, self) => state.cards[hqHeroUnder(state, self)?.cardId ?? '']?.cost ?? 0)

registerVillainAbilities('villain-carrion', {
  onFeast: async (state, _ui, self, feasted) => {
    const cityIndex = state.city.findIndex((card) => card?.instanceId === self.instanceId)
    if (cityIndex !== -1 && state.cards[feasted.cardId].hero !== undefined && (state.cards[feasted.cardId].cost ?? 0) >= 1) {
      state.returnVillainToCity = { instanceId: self.instanceId, cityIndex }
    }
  },
})

registerVillainAbilities('villain-demogoblin', {
  onAmbush: async (state, ui, self) => {
    await captureForVillain(state, ui, self)
  },
})

registerVillainAbilities('villain-shriek', {
  onFeast: async (state, ui, _self, feasted) => {
    if (state.cards[feasted.cardId].hero !== undefined && (state.cards[feasted.cardId].cost ?? 0) === 0) {
      await gainWound(state, ui)
    }
  },
  onEscape: async (state, ui) => {
    await gainWound(state, ui)
  },
})

// ---------- Sinister Six ----------

registerVillainAbilities('villain-chameleon', {
  onFight: async (state, ui, self) => {
    const hero = hqHeroUnder(state, self)
    if (!hero) return
    const data = state.cards[hero.cardId]
    addAttack(state, data.attack ?? 0)
    addRecruit(state, data.recruit ?? 0)
    const ability = getCardAbility(hero.cardId)
    if (ability) await ability(state, { self: hero, ui })
  },
})

registerVillainAbilities('villain-hobgoblin', {
  onAmbush: async (state, ui) => {
    const villains = state.city.filter(
      (card): card is CardInstance => !!card && state.cards[card.cardId].villainGroup === 'Sinister Six',
    )
    for (const villain of villains) await captureForVillain(state, ui, villain)
  },
})

registerStrengthModifier('villain-kraven-the-hunter', (state) => state.cards[highestCostHqHero(state)?.cardId ?? '']?.cost ?? 0)
registerVillainAbilities('villain-kraven-the-hunter', {
  onEscape: async (state) => {
    const target = highestCostHqHero(state)
    if (!target) return
    const index = state.hq.findIndex((card) => card?.instanceId === target.instanceId)
    if (index !== -1) {
      koFromHq(state, index)
      refillHq(state)
    }
  },
})

registerStrengthModifier('villain-sandman', (state) => state.city.filter(Boolean).length * 2)
registerVillainAbilities('villain-sandman', {
  onEscape: async (state, ui) => {
    await revealInstinctOrWound(state, ui, 'Sandman (Escape): reveal an Instinct Hero')
  },
})

registerVillainAbilities('villain-shocker', {
  onAmbush: async (state, ui) => {
    await revealInstinctOrDiscard(state, ui, 'Shocker (Ambush): reveal an Instinct Hero')
  },
})

registerVillainAbilities('villain-vulture', {
  onAmbush: async (state, ui, self) => {
    const bridge = state.city[CITY_NAMES.indexOf('Bridge')]
    const rooftops = state.city[CITY_NAMES.indexOf('Rooftops')]
    const targets = [bridge, rooftops].filter((card): card is CardInstance => !!card && card.instanceId !== self.instanceId)
    const chosen = await chooseOneCard(ui, targets, 'Vulture (Ambush): choose a Villain to swap with Vulture')
    if (!chosen) return
    const vultureIndex = state.city.findIndex((card) => card?.instanceId === self.instanceId)
    const targetIndex = state.city.findIndex((card) => card?.instanceId === chosen.instanceId)
    if (vultureIndex !== -1 && targetIndex !== -1) {
      state.city[vultureIndex] = chosen
      state.city[targetIndex] = self
    }
  },
  onEscape: async (state, ui) => {
    await revealInstinctOrWound(state, ui, 'Vulture (Escape): reveal an Instinct Hero')
  },
})
