import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { registerDefeatRequirement } from '../../../engine/villainRequirements'
import { koCard } from '../../../engine/keywords'
import { gainWound } from '../../../engine/game'
import { getScheme } from '../../../engine/schemeRegistry'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'

// ---------- Blob ----------

registerDefeatRequirement('villain-blob', (state) =>
  state.played.some((c) => (state.cards[c.cardId].team ?? []).includes('x-men')),
)

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
    // TODO: sprawdź w instrukcji, czy Mystique powinna zostać zdjęta ze stosu "uciekli"
    await ui.showInfo(self, 'Mystique zamienia się w Scheme Twist!')
    state.twistsRevealed += 1
    getScheme(state).onTwist?.(state, state.twistsRevealed)
  },
})

// ---------- Sabretooth ----------

async function revealXMenOrWound(state: GameState, ui: UiAdapter, prompt: string): Promise<void> {
  const xmenInHand = state.hand.filter((c) =>
    (state.cards[c.cardId].team ?? []).includes('x-men'),
  )

  if (xmenInHand.length > 0) {
    const chosen =
      xmenInHand.length === 1
        ? xmenInHand[0]
        : await ui.choose(xmenInHand, { prompt, optional: false })
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