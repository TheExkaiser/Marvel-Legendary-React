import { chooseOneCard, revealOneOr } from '../../../engine/abilityHelpers'
import { ascendVillainToMastermind } from '../../../engine/ascension'
import { registerCardAbility } from '../../../engine/cardAbilities'
import { getCardData, registerVillainHeroSide } from '../../../engine/cardData'
import { chargeVillain } from '../../../engine/charge'
import { adjacentCityIndexes } from '../../../engine/cityLayout'
import { logEvent } from '../../../engine/common'
import { CITY_NAMES } from '../../../engine/constants'
import { drawCards, revealTopCard } from '../../../engine/deckOps'
import { fatefulResurrectionVillain } from '../../../engine/fatefulResurrection'
import { registerCircleOfKungFu } from '../../../engine/kungFu'
import { countPlayedThisTurn, discardCard, haveZone, koCard, revealCards } from '../../../engine/keywords'
import { patrolCitySpace } from '../../../engine/patrol'
import { addAttack } from '../../../engine/resources'
import { crossDimensionalRampage } from '../../../engine/rampage'
import { canUseSpectrum } from '../../../engine/spectrum'
import { registerStrengthModifier } from '../../../engine/strengthModifiers'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'
import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { registerDefeatRequirement } from '../../../engine/villainRequirements'
import { resolveTwist } from '../../../engine/villainPhase'
import { gainWound } from '../../../engine/wounds'
import { koOneOfYourHeroes } from './heroAbilities'

const ID = 'secret-wars-2-'

// Master Strike'i Villainów, którzy wznoszą się na Mastermina (zdolności rejestruje masterStrikeAbilities.ts)
export const DEADPOOL_STRIKE_ID = `${ID}deadpool-master-strike`
export const ANGELA_STRIKE_ID = `${ID}angela-master-strike`
export const WARRIOR_WOMAN_STRIKE_ID = `${ID}warrior-woman-master-strike`
export const PROFESSOR_X_STRIKE_ID = `${ID}92-professor-x-master-strike`

// ---------- Pomocniki ----------

/** "Your Heroes" = Bohaterowie, których masz (jak Captain Britain: ręka, zagrane, discard, Artifacty). */
const yourHeroes = (state: GameState): CardInstance[] =>
  haveZone(state).filter((card) => !!getCardData(state, card).hero)

/** Bonus do siły, gdy Villain stoi na jednym z podanych pól miasta. */
const locationBonus = (state: GameState, villain: CardInstance, spaces: string[], bonus: number): number => {
  const index = state.city.findIndex((card) => card?.instanceId === villain.instanceId)
  return index !== -1 && spaces.includes(CITY_NAMES[index]) ? bonus : 0
}

/** Ten Villain porywa Bystandera ze stosu. */
async function captureWith(state: GameState, ui: UiAdapter, villain: CardInstance): Promise<void> {
  const bystander = state.bystanders.pop()
  if (!bystander) return
  state.captives[villain.instanceId] = [...(state.captives[villain.instanceId] ?? []), bystander]
  await ui.showCapture(villain, bystander, `Bystander captured by ${state.cards[villain.cardId].name}`)
}

async function discardOneFromHand(state: GameState, ui: UiAdapter, title: string): Promise<void> {
  const chosen = await chooseOneCard(ui, state.hand, `${title}: discard a card`)
  if (chosen) await discardCard(state, chosen.instanceId, ui)
}

async function koFromDiscard(state: GameState, ui: UiAdapter, title: string): Promise<void> {
  const chosen = await chooseOneCard(ui, state.discard, `${title}: KO a card from your discard pile`)
  if (chosen) koCard(state, chosen.instanceId)
}

/** "Each player reveals a Hero that costs N or more, or ...": bez takiego Bohatera wykonuje się onFail. */
async function revealHeroCostingOr(
  state: GameState,
  ui: UiAdapter,
  min: number,
  title: string,
  onFail: () => Promise<void>,
): Promise<void> {
  const heroes = revealCards(state).filter((card) => {
    const data = getCardData(state, card)
    return !!data.hero && (data.cost ?? 0) >= min
  })
  await revealOneOr(ui, heroes, `${title}: reveal a Hero that costs ${min} or more`, `Revealed a Hero that costs ${min} or more`, onFail)
}

// ---------- Deadpool's Secret Secret Wars ----------

registerCircleOfKungFu(`${ID}deadpool`, 5)
registerVillainAbilities(`${ID}deadpool`, {
  onDefeated: async (state, ui, self) => {
    await fatefulResurrectionVillain(state, ui, self)
  },
  onEscape: async (state, _ui, self) => {
    ascendVillainToMastermind(
      state,
      self,
      DEADPOOL_STRIKE_ID,
      'Each player reveals a Hero with an odd-numbered cost or gains a Wound. (0 is even).',
    )
  },
})

// Doop: nie można z nim walczyć, gdy w sąsiednim polu miasta stoi jakiś Villain
registerDefeatRequirement(`${ID}doop`, (state, villain) => {
  if (!villain) return true
  const index = state.city.findIndex((card) => card?.instanceId === villain.instanceId)
  if (index === -1) return true
  return adjacentCityIndexes(state, index).every((adjacent) => !state.city[adjacent])
})

registerCircleOfKungFu(`${ID}howard-the-duck`, 7) // 7th Circle of Quack-Fu
registerVillainAbilities(`${ID}howard-the-duck`, {
  onAmbush: async (state, ui, self) => {
    await captureWith(state, ui, self)
  },
})

registerVillainAbilities(`${ID}pink-sphinx`, {
  onFight: async (state, ui) => {
    if (canUseSpectrum(state)) await koOneOfYourHeroes(state, ui, 'Pink Sphinx (Fight): KO one of your Heroes')
  },
})

// ---------- Guardians of Knowhere ----------

registerVillainAbilities(`${ID}angela`, {
  onDefeated: async (state, ui, self) => {
    await fatefulResurrectionVillain(state, ui, self)
  },
  onEscape: async (state, _ui, self) => {
    ascendVillainToMastermind(
      state,
      self,
      ANGELA_STRIKE_ID,
      'Each player KOs a Hero from their discard pile that costs 1 or more.',
    )
  },
})

registerVillainAbilities(`${ID}drax-the-destroyer`, {
  onFight: async (state, ui) => {
    const top = await revealTopCard(state, ui, 'Drax the Destroyer: revealed the top card of your deck')
    if (!top) return
    const chosen = await ui.choose([top], { prompt: 'Drax the Destroyer: KO the revealed card? (otherwise it stays on top)', optional: true })
    if (chosen) koCard(state, top.instanceId)
  },
  onDefeated: async (state, ui, self) => {
    await fatefulResurrectionVillain(state, ui, self)
  },
})

registerVillainAbilities(`${ID}gamora`, {
  onAmbush: async (state, ui, self) => {
    await chargeVillain(state, ui, self, 1)
  },
  onDefeated: async (state, ui) => {
    if (patrolCitySpace(state, 'Sewers') !== 'empty') return
    logEvent(state, 'Gamora: Patrol the Sewers: empty')
    await gainWound(state, ui)
  },
  onEscape: async (state, ui) => gainWound(state, ui),
})

// Groot: po zmartwychwstaniu jest Tiny Dancing Groot (Attack 1, bez zdolności) do końca tury. Znacznik w oncePerTurnUsed zeruje się w endTurn.
const tinyGrootKey = (villain: CardInstance): string => `${ID}tiny-groot-${villain.instanceId}`
registerStrengthModifier(`${ID}groot`, (state, villain) => (state.oncePerTurnUsed?.[tinyGrootKey(villain)] ? -4 : 0))
registerVillainAbilities(`${ID}groot`, {
  onDefeated: async (state, ui, self) => {
    if (state.oncePerTurnUsed?.[tinyGrootKey(self)]) return
    if (await fatefulResurrectionVillain(state, ui, self)) {
      state.oncePerTurnUsed = { ...state.oncePerTurnUsed, [tinyGrootKey(self)]: true }
      logEvent(state, 'Groot becomes Tiny Dancing Groot (Attack 1, no abilities) for the rest of the turn')
    }
  },
})

registerVillainAbilities(`${ID}rocket-raccoon`, {
  onDefeated: async (state, ui) => {
    const patrol = patrolCitySpace(state, 'Bank')
    if (patrol === 'empty') {
      logEvent(state, 'Rocket Raccoon: Patrol the Bank: empty')
      drawCards(state, 1)
    } else if (patrol === 'occupied') {
      logEvent(state, 'Rocket Raccoon: Patrol the Bank: not empty')
      await koOneOfYourHeroes(state, ui, 'Rocket Raccoon (Fight): KO one of your Heroes')
    }
  },
})

// ---------- K'un-Lun ----------

registerCircleOfKungFu(`${ID}laughing-skull`, 5)
registerVillainAbilities(`${ID}laughing-skull`, {
  onEscape: async (state, ui) => {
    await revealHeroCostingOr(state, ui, 5, 'Laughing Skull (Escape)', () => discardOneFromHand(state, ui, 'Laughing Skull (Escape)'))
  },
})

registerCircleOfKungFu(`${ID}rand-kai`, 6)
registerVillainAbilities(`${ID}rand-kai`, {
  onEscape: async (state, ui) => {
    await revealHeroCostingOr(state, ui, 6, "Rand K'ai (Escape)", () => gainWound(state, ui))
  },
})

registerCircleOfKungFu(`${ID}razor-fist`, 3)
registerVillainAbilities(`${ID}razor-fist`, {
  onFight: async (state, ui) => {
    const count = yourHeroes(state).filter((card) => getCardData(state, card).cost === 3).length
    for (let i = 0; i < count; i++) await koOneOfYourHeroes(state, ui, `Razor Fist (Fight): KO one of your Heroes (${i + 1}/${count})`)
  },
})

registerCircleOfKungFu(`${ID}red-sai`, 4)
registerVillainAbilities(`${ID}red-sai`, {
  onFight: async (state) => {
    const count = yourHeroes(state).filter((card) => getCardData(state, card).cost === 4).length
    if (count > 0) drawCards(state, count)
  },
})

// ---------- Monster Metropolis ----------

registerVillainAbilities(`${ID}bug-shiklahs-dragon`, {
  onFight: async (state, ui) => {
    await koFromDiscard(state, ui, "Bug, Shiklah's Dragon (Fight)")
  },
  onDefeated: async (state, ui, self) => {
    await fatefulResurrectionVillain(state, ui, self)
  },
})

registerVillainAbilities(`${ID}ghost-deadpool`, {
  onDefeated: async (state, ui, self) => {
    await fatefulResurrectionVillain(state, ui, self)
    await crossDimensionalRampage(state, ui, 'Deadpool')
  },
  onEscape: async (state, ui) => crossDimensionalRampage(state, ui, 'Deadpool'),
})

registerVillainAbilities(`${ID}man-thing`, {
  onAmbush: async (state, ui) => {
    const group = state.city.filter(
      (card): card is CardInstance => !!card && getCardData(state, card).villainGroup === 'Monster Metropolis',
    )
    for (const villain of group) await captureWith(state, ui, villain)
  },
  onDefeated: async (state, ui, self) => {
    await fatefulResurrectionVillain(state, ui, self)
  },
})

// Marcus: na Sewers, Rooftops i Bridge jest w "wolf form" (+3 Attack)
registerStrengthModifier(`${ID}marcus-symbiote-centaur`, (state, villain) =>
  locationBonus(state, villain, ['Sewers', 'Rooftops', 'Bridge'], 3),
)
registerVillainAbilities(`${ID}marcus-symbiote-centaur`, {
  onAmbush: async (state, ui, self) => {
    await chargeVillain(state, ui, self, 2)
  },
})

// ---------- Utopolis ----------

registerVillainAbilities(`${ID}doctor-spectrum`, {
  onAmbush: async (state, ui, self) => {
    await chargeVillain(state, ui, self, 1)
  },
  onFight: async (state, ui) => {
    if (canUseSpectrum(state)) await koFromDiscard(state, ui, 'Doctor Spectrum (Fight)')
  },
  onEscape: async (state, ui) => {
    if (!canUseSpectrum(state)) await discardOneFromHand(state, ui, 'Doctor Spectrum (Escape)')
  },
})

// Nighthawk: +4 Attack na Sewers, Rooftops i Bridge; przy ucieczce staje się Scheme Twistem (znika z Escape Pile)
registerStrengthModifier(`${ID}nighthawk`, (state, villain) =>
  locationBonus(state, villain, ['Sewers', 'Rooftops', 'Bridge'], 4),
)
registerVillainAbilities(`${ID}nighthawk`, {
  onEscape: async (state, ui, self) => {
    const index = state.escaped.findIndex((card) => card.instanceId === self.instanceId)
    if (index !== -1) state.escaped.splice(index, 1)
    await resolveTwist(state, self, ui)
  },
})

registerVillainAbilities(`${ID}warrior-woman`, {
  onAmbush: async (state, ui, self) => {
    await chargeVillain(state, ui, self, 1)
  },
  onEscape: async (state, _ui, self) => {
    ascendVillainToMastermind(
      state,
      self,
      WARRIOR_WOMAN_STRIKE_ID,
      "Patrol the Bank: If there's a Villain there, each player discards a card with a Recruit icon.",
    )
  },
})

registerVillainAbilities(`${ID}whizzer`, {
  onAmbush: async (state, ui, self) => {
    await chargeVillain(state, ui, self, 3)
  },
  onDefeated: async (state, ui) => {
    if (patrolCitySpace(state, 'Bridge') !== 'occupied') return
    logEvent(state, 'Whizzer: Patrol the Bridge: there is a Villain there')
    await gainWound(state, ui)
  },
  onEscape: async (state, ui) => gainWound(state, ui),
})

// ---------- X-Men '92 ----------
// Beast, Jubilee i Wolverine: "Fight: Gain this as a Hero" (keyword villain-hero). Koszt Bohatera = domyślny Attack Villaina (cardData.ts).

registerVillainAbilities(`${ID}92-beast`, {
  onAmbush: async (state, ui, self) => {
    await chargeVillain(state, ui, self, 1)
  },
})
registerVillainHeroSide(`${ID}92-beast`, {
  attack: 2,
  type: ['strength'],
  team: ['x-men'],
  conditionIcons: ['tech'],
  conditionText: 'Draw a card.',
})
registerCardAbility(`${ID}92-beast`, async (state) => {
  if (countPlayedThisTurn(state, { type: 'tech' }) > 0) drawCards(state, 1)
})

registerVillainHeroSide(`${ID}92-jubilee`, {
  attack: 2,
  type: ['ranged'],
  team: ['x-men'],
  text: 'Spectrum: You get +2 Attack.',
})
registerCardAbility(`${ID}92-jubilee`, async (state) => {
  if (canUseSpectrum(state)) addAttack(state, 2)
})

registerVillainAbilities(`${ID}92-wolverine`, {
  onEscape: async (state, ui) => crossDimensionalRampage(state, ui, 'Wolverine'),
})
registerVillainHeroSide(`${ID}92-wolverine`, {
  attack: 2,
  type: ['instinct'],
  team: ['x-men'],
  conditionIcons: ['instinct'],
  conditionText: 'Draw two cards.',
})
registerCardAbility(`${ID}92-wolverine`, async (state) => {
  if (countPlayedThisTurn(state, { type: 'instinct' }) > 0) drawCards(state, 2)
})

// '92 Professor X: przy ucieczce wznosi się na Mastermina (Master Strike układa Bohaterów obok niego, masterStrikeAbilities.ts)
registerVillainAbilities(`${ID}92-professor-x`, {
  onEscape: async (state, _ui, self) => {
    ascendVillainToMastermind(
      state,
      self,
      PROFESSOR_X_STRIKE_ID,
      "Stack the two heroes from the HQ with the highest cost next to '92 Professor X. He gets +1 Attack for each Hero stacked there. Players can recruit the top card of the stack.",
    )
  },
})

// ---------- Henchmeni ----------

// Khonshu Guardians: na Sewers, Rooftops i Bridge są w "wolf form" (+2 Attack)
registerStrengthModifier(`${ID}henchmen-khonshu-guardians`, (state, villain) =>
  locationBonus(state, villain, ['Sewers', 'Rooftops', 'Bridge'], 2),
)
registerVillainAbilities(`${ID}henchmen-khonshu-guardians`, {
  onFight: async (state, ui) => {
    await koOneOfYourHeroes(state, ui, 'Khonshu Guardians (Fight): KO one of your Heroes')
  },
})

registerVillainAbilities(`${ID}henchmen-magma-men`, {
  onFight: async (state, ui) => {
    await koOneOfYourHeroes(state, ui, 'Magma Men (Fight): KO one of your Heroes')
  },
  onDefeated: async (state, ui, self) => {
    await fatefulResurrectionVillain(state, ui, self)
  },
})

// Spider-Infected: Ambush porywa Bystandera, Fight daje następnemu zrekrutowanemu Bohaterowi Wall-Crawl (recruit.ts, endTurn zeruje)
registerVillainAbilities(`${ID}henchmen-spider-infected`, {
  onAmbush: async (state, ui, self) => {
    await captureWith(state, ui, self)
  },
  onFight: async (state) => {
    state.nextHeroHasWallCrawlThisTurn = true
  },
})
