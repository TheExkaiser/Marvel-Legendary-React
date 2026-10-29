import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { registerStrengthModifier } from '../../../engine/strengthModifiers'
import { drawCards, gainWound } from '../../../engine/game'
import { isVillainCard } from '../../../engine/keywords'
import { loseShard, placeShardsOn, shardsOn } from '../../../engine/shards'
import type { CardInstance, GameState } from '../../../engine/types'

const KREE_STARFORCE = 'Kree Starforce'

const villainsInCity = (state: GameState): CardInstance[] =>
  state.city.filter((card): card is CardInstance => !!card && isVillainCard(state.cards[card.cardId]))

// ---------- Kree Starforce ----------

registerStrengthModifier('villain-captain-atlas', (state) => shardsOn(state, state.mastermind))
registerVillainAbilities('villain-captain-atlas', {
  onEscape: async (state, ui) => {
    // "Each player" = gracz: traci Shard, a jeśli nie ma, dostaje Wound
    if (!loseShard(state)) await gainWound(state, ui)
  },
})

registerVillainAbilities('villain-demon-druid', {
  onAmbush: async (state, ui, self) => {
    const targets = villainsInCity(state).filter((villain) => villain.instanceId !== self.instanceId)
    if (targets.length === 0) return
    const chosen =
      targets.length === 1
        ? targets[0]
        : await ui.choose(targets, { prompt: 'Demon Druid (Ambush): choose another Villain to gain two Shards', optional: false })
    if (chosen) placeShardsOn(state, chosen, 2)
  },
})

registerVillainAbilities('villain-dr-minerva', {
  onAmbush: async (state) => {
    for (const villain of villainsInCity(state)) {
      if (state.cards[villain.cardId].villainGroup === KREE_STARFORCE) placeShardsOn(state, villain, 1)
    }
  },
})

registerVillainAbilities('villain-korath-the-pursuer', {
  onAmbush: async (state, ui, self) => {
    if (state.deck.length + state.discard.length === 0) return
    const choice = await ui.chooseOptionWithCard(
      self,
      [
        { id: 'draw', label: 'Draw a card (Korath gains a Shard)' },
        { id: 'skip', label: 'Do not draw' },
      ],
      'Korath the Pursuer (Ambush): draw a card?',
    )
    if (choice !== 'draw') return
    drawCards(state, 1)
    placeShardsOn(state, self, 1)
  },
  onEscape: async (state, ui, self) => {
    // Shardy uciekiniera przechodzą na Mastermind dopiero po tym efekcie, więc tu jeszcze leżą na Korathcie
    if (shardsOn(state, self) > 0) await gainWound(state, ui)
  },
})

// "Each player" = gracz (zasada projektu), więc oskarżonym jest zawsze on i dostaje Wound
async function ronanAccuses(state: GameState, ui: Parameters<typeof gainWound>[1]): Promise<void> {
  await gainWound(state, ui)
}
registerVillainAbilities('villain-ronan-the-accuser', { onAmbush: ronanAccuses, onEscape: ronanAccuses })

registerVillainAbilities('villain-shatterax', {
  onFight: async (state) => {
    for (const hero of state.hq) {
      if (hero && state.cards[hero.cardId].hero !== undefined) placeShardsOn(state, hero, 1)
    }
  },
})

registerVillainAbilities('villain-supremor', {
  onAmbush: async (state, _ui, self) => {
    placeShardsOn(state, self, 1)
    placeShardsOn(state, state.mastermind, 1)
  },
})
