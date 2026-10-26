import { registerCardAbility } from '../../../engine/cardAbilities'
import { registerPlayRequirement } from '../../../engine/cardRequirements'
import { addAttack, addRecruit, drawCards, recruitHero } from '../../../engine/game'
import { countPlayedThisTurn } from '../../../engine/keywords'
import {
  discardTopCard,
  drawRevealed,
  putCardsOnTop,
  revealTopAndDrawIf,
  revealTopCard,
  takeTopCards,
} from '../../../engine/deckOps'
import { CITY_NAMES } from '../../../engine/constants'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'

async function putCardsFromHandOnTop(state: GameState, ui: UiAdapter, count: number, prompt: string): Promise<void> {
  for (let i = 0; i < count; i++) {
    const chosen = await ui.choose(state.hand, { prompt, optional: false })
    if (!chosen) return
    const index = state.hand.findIndex((card) => card.instanceId === chosen.instanceId)
    if (index === -1) return
    putCardsOnTop(state, state.hand.splice(index, 1))
  }
}

function requireCardsInHand(count: number) {
  return (state: GameState) => state.hand.length >= count
}

// ---------- Black Cat ----------

registerCardAbility('hero-black-cat-casual-bank-robbery', async (state) => {
  state.hqRecruitBonuses = { ...(state.hqRecruitBonuses ?? {}), Bank: (state.hqRecruitBonuses?.Bank ?? 0) + 1 }
})

registerCardAbility('hero-black-cat-pickpocket', async (state, { ui }) => {
  const card = await revealTopCard(state, ui, 'Pickpocket: revealed the top card of your deck')
  if (card) addAttack(state, (state.cards[card.cardId].attack ?? 0) + (state.cards[card.cardId].recruit ?? 0))
})

registerCardAbility('hero-black-cat-jinx', async (state, { ui }) => {
  const card = await revealTopCard(state, ui, 'Jinx: revealed the top card of your deck')
  if (!card) return
  const chosen = await ui.choose([card], { prompt: 'Jinx: discard the revealed card?', optional: true })
  if (chosen) discardTopCard(state)
})

registerCardAbility('hero-black-cat-cat-burglar', async (state) => {
  addAttack(state, state.bystandersRescuedThisTurn ?? 0)
})

// ---------- Moon Knight ----------

registerCardAbility('hero-moon-knight-climbing-claws', async (state) => {
  if (countPlayedThisTurn(state, { type: 'instinct' }) > 0) addRecruit(state, 1)
})

registerCardAbility('hero-moon-knight-lunar-communion', async (state) => {
  state.rooftopsKoAvailable = (state.rooftopsKoAvailable ?? 0) + 1
})

registerCardAbility('hero-moon-knight-crescent-moon-darts', async (state, { ui }) => {
  await revealTopAndDrawIf(
    state,
    ui,
    (card) => {
      const data = state.cards[card.cardId]
      return !!data.hero && (data.type ?? []).some((type) => type === 'instinct' || type === 'tech')
    },
    'Crescent Moon Darts: revealed the top card of your deck',
  )
})

registerCardAbility('hero-moon-knight-golden-ankh-of-khonshu', async (state, { ui }) => {
  state.rooftopsRescueVpBonus = (state.rooftopsRescueVpBonus ?? 0) + 1
  if (countPlayedThisTurn(state, { type: 'tech' }) === 0) return
  const targets = state.city.filter((card): card is CardInstance => !!card)
  if (targets.length === 0) return
  const chosen = await ui.choose(targets, { prompt: 'Golden Ankh of Khonshu: move a Villain to the Rooftops', optional: true })
  if (!chosen) return
  const from = state.city.findIndex((card) => card?.instanceId === chosen.instanceId)
  const rooftops = CITY_NAMES.indexOf('Rooftops')
  const occupant = state.city[rooftops]
  state.city[rooftops] = chosen
  state.city[from] = occupant ?? null
})

// ---------- Scarlet Spider ----------

registerCardAbility('hero-scarlet-spider-flip-out', async (state) => {
  if (countPlayedThisTurn(state, { team: 'spider-friends' }) > 0) drawCards(state, 1)
})

registerCardAbility('hero-scarlet-spider-perfect-hunter', async (state) => {
  drawCards(state, 1)
})

registerCardAbility('hero-scarlet-spider-leap-from-above', async (state) => {
  if (countPlayedThisTurn(state, { type: 'instinct' }) > 0) addAttack(state, 2)
})

registerCardAbility('hero-scarlet-spider-sting-of-the-spider', async () => undefined)

// ---------- Spider-Woman ----------

registerCardAbility('hero-spider-woman-bioelectric-shock', async (state, { ui }) => {
  await revealTopAndDrawIf(state, ui, (card) => (state.cards[card.cardId].attack ?? 0) > 0, 'Bioelectric Shock: revealed the top card of your deck')
})

registerCardAbility('hero-spider-woman-radioactive-spider', async (state, { ui }) => {
  await putCardsFromHandOnTop(state, ui, 1, 'Radioactive Spider: put a card from your hand on top of your deck')
})

registerCardAbility('hero-spider-woman-venom-blast', async (state, { ui }) => {
  await revealTopAndDrawIf(state, ui, (card) => (state.cards[card.cardId].recruit ?? 0) > 0, 'Venom Blast: revealed the top card of your deck')
})

registerCardAbility('hero-spider-woman-arachno-pheromones', async (state, { ui }) => {
  const targets = state.hq.filter((card): card is CardInstance => !!card && !!state.cards[card.cardId].hero)
  if (targets.length === 0) return
  const chosen = await ui.choose(targets, { prompt: 'Arachno-Pheromones: recruit a Hero for free', optional: false })
  if (!chosen) return
  const beforeRecruit = state.recruit
  const beforeAttack = state.attack
  const index = state.hq.findIndex((card) => card?.instanceId === chosen.instanceId)
  const cost = index >= 0 ? (state.cards[chosen.cardId].cost ?? 0) : 0
  state.recruit += cost
  recruitHero(state, chosen.instanceId)
  state.recruit = beforeRecruit
  state.attack = beforeAttack
  if (countPlayedThisTurn(state, { team: 'spider-friends' }) > 0) {
    const recruited = state.discard.find((card) => card.cardId === chosen.cardId)
    if (recruited) {
      state.discard = state.discard.filter((card) => card.instanceId !== recruited.instanceId)
      putCardsOnTop(state, [recruited])
    }
  }
})

// ---------- Symbiote Spider-Man ----------

registerCardAbility('hero-symbiote-spider-man-dark-strength', async (state, { ui }) => {
  const card = await revealTopCard(state, ui, 'Dark Strength: revealed the top card of your deck')
  if (card && [1, 2].includes(state.cards[card.cardId].cost ?? -1)) addAttack(state, 2)
})

registerCardAbility('hero-symbiote-spider-man-spider-sense-tingling', async (state, { ui }) => {
  const cards = takeTopCards(state, 2)
  for (const card of cards) await ui.showInfo(card, 'Spider-Sense Tingling: revealed a card')
  const keep = cards.filter((card) => (state.cards[card.cardId].cost ?? 0) <= 2)
  const rest = cards.filter((card) => !keep.includes(card))
  drawRevealed(state, keep)
  putCardsOnTop(state, rest)
})

registerCardAbility('hero-symbiote-spider-man-shadowed-spider', async (state) => {
  const count = state.cardsPlayedThisTurn.filter((card) => {
    const data = state.cards[card.cardId]
    return !!data.hero && card.cardId !== 'hero-symbiote-spider-man-shadowed-spider' && (data.cost ?? 0) <= 2
  }).length
  addAttack(state, count)
})

registerPlayRequirement('hero-spider-woman-radioactive-spider', requireCardsInHand(1))
registerPlayRequirement('hero-symbiote-spider-man-thwip', requireCardsInHand(2))
registerCardAbility('hero-symbiote-spider-man-thwip', async (state, { ui }) => {
  await putCardsFromHandOnTop(state, ui, 2, 'Thwip!: put a card from your hand on top of your deck')
})
