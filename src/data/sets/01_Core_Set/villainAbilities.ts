import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { registerDefeatRequirement } from '../../../engine/villainRequirements'
import { koCard, hasCard, revealCards, haveCards, isShieldHero } from '../../../engine/keywords'
import { gainWound, takeTopCards, drawCards } from '../../../engine/game'
import { getScheme } from '../../../engine/schemeRegistry'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'

// ---------- Blob ----------

registerDefeatRequirement('villain-blob', (state) => hasCard(state, { team: 'x-men' }))

// ---------- Juggernaut ----------

async function koTwoHeroesFrom(
  state: GameState,
  ui: UiAdapter,
  pile: CardInstance[],
  prompt: string,
): Promise<void> {
  for (let i = 0; i < 2; i++) {
    const heroes = pile.filter((c) => state.cards[c.cardId].hero !== undefined)
    if (heroes.length === 0) return

    const chosen =
      heroes.length === 1
        ? heroes[0]
        : await ui.choose(heroes, { prompt, optional: false })
    if (!chosen) return
    koCard(state, chosen.instanceId)
  }
}

registerVillainAbilities('villain-juggernaut', {
  onAmbush: async (state, ui) => {
    await koTwoHeroesFrom(state, ui, state.discard, 'Juggernaut (Ambush): KO bohatera ze stosu odrzuconych')
  },
  onEscape: async (state, ui) => {
    await koTwoHeroesFrom(state, ui, state.hand, 'Juggernaut (Escape): KO bohatera z ręki')
  },
})

// ---------- Mystique ----------

registerVillainAbilities('villain-mystique', {
  onEscape: async (state, ui, self) => {
    await ui.showInfo(self, 'Mystique zamienia się w Scheme Twist!')
    state.twistsRevealed += 1
    await getScheme(state).onTwist?.(state, state.twistsRevealed, ui)
  },
})

// ---------- Sabretooth ----------

async function revealXMenOrWound(state: GameState, ui: UiAdapter, prompt: string): Promise<void> {
  const xmenToReveal = revealCards(state, { team: 'x-men' })  

  if (xmenToReveal.length > 0) {
    const chosen =
      xmenToReveal.length === 1
        ? xmenToReveal[0]
        : await ui.choose(xmenToReveal, { prompt, optional: false })
    if (chosen) {
      await ui.showInfo(chosen, `${prompt}: ujawniono X-Men`)
      return
    }
  }

  await gainWound(state, ui)
}

registerVillainAbilities('villain-sabretooth', {
  onFight: async (state, ui) => {
    await revealXMenOrWound(state, ui, 'Sabretooth (Fight): ujawnij X-Men lub zdobądź ranę')
  },
  onEscape: async (state, ui) => {
    await revealXMenOrWound(state, ui, 'Sabretooth (Escape): ujawnij X-Men lub zdobądź ranę')
  },
})

// ---------- Doombot Legion ----------

registerVillainAbilities('henchmen-doombot-legion', {
  onFight: async (state, ui) => {
    const topTwo = takeTopCards(state, 2)
    if (topTwo.length === 0) return

    const chosen =
      topTwo.length === 1
        ? topTwo[0]
        : await ui.choose(topTwo, {
            prompt: 'Doombot Legion (Fight): wybierz kartę do KO, druga wróci na wierzch talii',
            optional: false,
          })
    if (!chosen) return

    state.ko.push(chosen)
    for (const card of topTwo) {
      if (card.instanceId !== chosen.instanceId) state.deck.push(card)
    }
  },
})

// ---------- Destroyer ----------

registerVillainAbilities('villain-destroyer', {
  onFight: async (state) => {
    const shieldHeroes = haveCards(state).filter((c) => isShieldHero(state.cards[c.cardId]))
    for (const c of shieldHeroes) {
      koCard(state, c.instanceId)
    }
  },
  onEscape: async (state, ui) => {
    await koTwoHeroesFrom(state, ui, state.hand, 'Destroyer (Escape): KO a Hero from your hand')
  },
})

// ---------- Enchantress ----------

registerVillainAbilities('villain-enchantress', {
  onFight: async (state) => {
    drawCards(state, 3)
  },
})

// ---------- Frost Giant ----------

async function revealRangedOrWound(state: GameState, ui: UiAdapter, prompt: string): Promise<void> {
  const rangedToReveal = revealCards(state, { type: 'ranged' })

  if (rangedToReveal.length > 0) {
    const chosen =
      rangedToReveal.length === 1
        ? rangedToReveal[0]
        : await ui.choose(rangedToReveal, { prompt, optional: false })
    if (chosen) {
      await ui.showInfo(chosen, `${prompt}: revealed a Ranged Hero`)
      return
    }
  }

  await gainWound(state, ui)
}

registerVillainAbilities('villain-frost-giant', {
  onFight: async (state, ui) => {
    await revealRangedOrWound(state, ui, 'Frost Giant (Fight): reveal a Ranged Hero or gain a Wound')
  },
  onEscape: async (state, ui) => {
    await revealRangedOrWound(state, ui, 'Frost Giant (Escape): reveal a Ranged Hero or gain a Wound')
  },
})

// ---------- Ymir, Frost Giant King ----------

registerVillainAbilities('villain-ymir', {
  onAmbush: async (state, ui) => {
    await revealRangedOrWound(state, ui, 'Ymir (Ambush): reveal a Ranged Hero or gain a Wound')
  },
  onFight: async (state, ui) => {
    let wounds = [...state.hand, ...state.discard].filter(
      (c) => state.cards[c.cardId].kind === 'wound',
    )
    while (wounds.length > 0) {
      const chosen = await ui.choose(wounds, {
        prompt: 'Ymir (Fight): KO a Wound from your hand or discard pile',
        optional: true,
      })
      if (!chosen) break
      koCard(state, chosen.instanceId)
      wounds = wounds.filter((c) => c.instanceId !== chosen.instanceId)
    }
  },
})