import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { registerStrengthModifier } from '../../../engine/strengthModifiers'
import { registerArtifactAbilities, registerArtifactReactions } from '../../../engine/artifacts'
import { registerCardAbility } from '../../../engine/cardAbilities'
import { drawCards, gainWound, addAttack, addRecruit } from '../../../engine/game'
import { isVillainCard } from '../../../engine/keywords'
import { CITY_NAMES } from '../../../engine/constants'
import { isCityDestroyed } from '../../../engine/cityLayout'
import { playTopVillainCard } from '../../../engine/villainPhase'
import { gainShards, loseShard, placeShardsOn, shardSupply, shardsOn } from '../../../engine/shards'
import type { CardInstance, GameState } from '../../../engine/types'

const KREE_STARFORCE = 'Kree Starforce'

const villainsInCity = (state: GameState): CardInstance[] =>
  state.city.filter((card): card is CardInstance => !!card && isVillainCard(state.cards[card.cardId]))

const INFINITY_GEMS = 'Infinity Gems'
const isInfinityGem = (state: GameState, card: CardInstance): boolean =>
  state.cards[card.cardId].villainGroup === INFINITY_GEMS

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

// ---------- Infinity Gems ----------

registerVillainAbilities('villain-infinity-gems-mind-gem', {
  onAmbush: async (state, _ui, self) => {
    const twistsInKo = state.ko.filter((card) => state.cards[card.cardId].kind === 'twist').length
    placeShardsOn(state, self, twistsInKo + (state.schemeTwists?.length ?? 0))
  },
})

registerVillainAbilities('villain-infinity-gems-power-gem', {
  onAmbush: async (state, _ui, self) => {
    const strikesInKo = state.ko.filter((card) => state.cards[card.cardId].kind === 'masterstrike').length
    placeShardsOn(state, self, strikesInKo + (state.stackedMasterStrikes?.length ?? 0))
  },
})

registerVillainAbilities('villain-infinity-gems-reality-gem', {
  onAmbush: async (state, _ui, self) => {
    const gemsInCity = state.city.filter((card): card is CardInstance => !!card && isInfinityGem(state, card)).length
    const gemsEscaped = state.escaped.filter((card) => isInfinityGem(state, card)).length
    placeShardsOn(state, self, gemsInCity + gemsEscaped)
  },
})

registerVillainAbilities('villain-infinity-gems-soul-gem', {
  onAmbush: async (state, _ui, self) => {
    placeShardsOn(state, self, villainsInCity(state).length)
  },
})

registerVillainAbilities('villain-infinity-gems-space-gem', {
  onAmbush: async (state, _ui, self) => {
    const emptySpaces = state.city.filter((card, index) => !card && !isCityDestroyed(state, index)).length
    placeShardsOn(state, self, emptySpaces)
  },
})

registerVillainAbilities('villain-infinity-gems-time-gem', {
  onAmbush: async (state, ui, self) => {
    const playedCard = await playTopVillainCard(state, ui)
    if (playedCard) placeShardsOn(state, self, state.cards[playedCard.cardId].vp ?? 0)
  },
})

registerArtifactAbilities('villain-infinity-gems-mind-gem', [
  {
    id: 'recruit',
    label: '+2 Recruit',
    effect: async (state) => addRecruit(state, 2),
  },
])

registerArtifactAbilities('villain-infinity-gems-power-gem', [
  {
    id: 'attack',
    label: '+2 Attack',
    effect: async (state) => addAttack(state, 2),
  },
])

registerArtifactReactions('villain-infinity-gems-reality-gem', {
  'before-villain-card': async (state, ui, self) => {
    const topCard = state.villainDeck[state.villainDeck.length - 1]
    if (!topCard) return

    const choice = await ui.chooseOptionWithCard(
      self,
      [
        { id: 'reveal', label: 'Reveal the top card of the Villain Deck' },
        { id: 'skip', label: 'Do not reveal' },
      ],
      'Reality Gem: reveal the top card of the Villain Deck?',
    )
    if (choice !== 'reveal') return

    await ui.revealCard(topCard, 'Reality Gem: top card of the Villain Deck')
    if (state.cards[topCard.cardId].kind === 'twist') return

    const putOnBottom = await ui.chooseOptionWithCard(
      topCard,
      [
        { id: 'bottom', label: 'Put it on the bottom and gain a Shard' },
        { id: 'keep', label: 'Leave it on top' },
      ],
      'Reality Gem: put this card on the bottom of the Villain Deck?',
    )
    if (putOnBottom !== 'bottom') return

    const topIndex = state.villainDeck.findIndex((card) => card.instanceId === topCard.instanceId)
    if (topIndex !== state.villainDeck.length - 1) {
      throw new Error('Reality Gem: the revealed card is no longer on top of the Villain Deck')
    }
    const [card] = state.villainDeck.splice(topIndex, 1)
    state.villainDeck.unshift(card)
    gainShards(state, 1)
  },
})

registerArtifactReactions('villain-infinity-gems-soul-gem', {
  'villain-defeated': async (state, _ui, self) => {
    placeShardsOn(state, self, 1)
  },
})

registerArtifactAbilities('villain-infinity-gems-soul-gem', [
  {
    id: 'attack-per-shard',
    label: 'Gain Attack per Shard',
    isUsable: (state, self) => shardsOn(state, self) > 0,
    effect: async (state, _ui, self) => addAttack(state, shardsOn(state, self)),
  },
])

registerArtifactAbilities('villain-infinity-gems-space-gem', [
  {
    id: 'move-villain',
    label: 'Move a Villain',
    isUsable: (state) =>
      villainsInCity(state).length > 0 &&
      state.city.filter((_, index) => !isCityDestroyed(state, index)).length > 1,
    effect: async (state, ui) => {
      const villains = villainsInCity(state)
      const chosen =
        villains.length === 1
          ? villains[0]
          : await ui.choose(villains, { prompt: 'Space Gem: choose a Villain to move', optional: false })
      if (!chosen) return

      const from = state.city.findIndex((card) => card?.instanceId === chosen.instanceId)
      const destinations = CITY_NAMES.map((name, index) => ({ name, index }))
        .filter(({ index }) => index !== from && !isCityDestroyed(state, index))
      const destination = await ui.chooseOption(
        destinations.map(({ name, index }) => ({ id: String(index), label: name })),
        'Space Gem: choose another city space',
      )
      if (destination === null) return

      const to = Number(destination)
      const other = state.city[to]
      state.city[to] = chosen
      state.city[from] = other
      if (shardSupply(state) > 0) gainShards(state, 1)
    },
  },
])

registerCardAbility('villain-infinity-gems-time-gem', async (state) => {
  if (state.counters['infinityGemTimeGemPlayed']) return
  state.counters['infinityGemTimeGemPlayed'] = 1
  state.extraTurnsQueued += 1
})
