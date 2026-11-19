import { chooseOneCard, revealOneOr } from '../../../engine/abilityHelpers'
import { registerCardAbility } from '../../../engine/cardAbilities'
import { gainVillainWithHeroSide, getCardData, registerVillainHeroSide } from '../../../engine/cardData'
import { defeatVillainFree } from '../../../engine/combat'
import { logEvent } from '../../../engine/common'
import { drawCards } from '../../../engine/deckOps'
import { discardCard, isVillainCard, revealCards } from '../../../engine/keywords'
import { shuffle } from '../../../engine/random'
import { refillHq } from '../../../engine/recruit'
import { addAttack, addRecruit } from '../../../engine/resources'
import { claimShardsOn, returnShardsOn } from '../../../engine/shards'
import { fatefulResurrectionTactic, returnTacticToPile } from '../../../engine/tacticReturn'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'
import { revealTopVillainCards } from '../../../engine/villainPhase'
import { canDefeatVillain } from '../../../engine/villainRequirements'
import { gainWound, rescueBystander } from '../../../engine/wounds'
import { KING_HYPERION, SHIKLAH_THE_DEMON_BRIDE } from './cards'

// ---------- Wspólne pomocniki (używane też przez masterStrikeAbilities) ----------

const isBystander = (state: GameState, card: CardInstance): boolean => state.cards[card.cardId].kind === 'bystander'

/** Spider-Infected rozpoznajemy po nazwie karty (grupa Spider-Infected dojdzie w kolejnym kroku). */
export const isSpiderInfected = (state: GameState, card: CardInstance): boolean =>
  getCardData(state, card).name === 'Spider-Infected'

/** Odrzuć karty z ręki, aż zostanie `size`. */
export async function discardDownTo(state: GameState, ui: UiAdapter, size: number, title: string): Promise<void> {
  while (state.hand.length > size) {
    const before = state.hand.length
    const chosen = await ui.choose(state.hand, {
      prompt: `${title}: discard down to ${size} cards (${state.hand.length} in hand)`,
      optional: false,
    })
    if (!chosen) break
    await discardCard(state, chosen.instanceId, ui)
    if (state.hand.length >= before) break // odrzucenie zostało zatrzymane, nie kręcimy się w kółko
  }
}

const hasTeamHero = (state: GameState, card: CardInstance, team: string): boolean => {
  const data = getCardData(state, card)
  return !!data.hero && (data.team ?? []).some((candidate) => candidate.toLowerCase() === team)
}

// "Defeat a Villain in the city for free": tylko Villainowie (nie Mastermind stojący w mieście)
async function defeatCityVillainForFree(state: GameState, ui: UiAdapter, title: string, optional: boolean): Promise<void> {
  const targets = state.city.filter(
    (card): card is CardInstance =>
      !!card && isVillainCard(getCardData(state, card)) && canDefeatVillain(state, card.cardId),
  )
  if (targets.length === 0) return
  const prompt = `${title}: defeat a Villain in the city for free`
  const chosen = optional
    ? await ui.choose(targets, { prompt, optional: true })
    : await chooseOneCard(ui, targets, prompt)
  if (chosen) await defeatVillainFree(state, chosen.instanceId, ui)
}

// ---------- Immortal Emperor Zheng-Zhu ----------

registerCardAbility('secret-wars-2-zheng-zhu-ultimate-kung-fu-mastery', async (state, { ui }) => {
  const circles = state.defeated.filter((card) => /Circle of (Kung|Quack)-Fu/.test(getCardData(state, card).text ?? ''))
  await revealOneOr(
    ui,
    circles,
    'Ultimate Kung-Fu Mastery: reveal a card with "Circle of Kung-Fu" from your Victory Pile',
    'Revealed a card with Circle of Kung-Fu',
    () => gainWound(state, ui),
  )
})

registerCardAbility('secret-wars-2-zheng-zhu-emperors-justice', async (state, { ui }) => {
  const heroes = revealCards(state).filter((card) => hasTeamHero(state, card, 'marvel-knights'))
  await revealOneOr(ui, heroes, "Emperor's Justice: reveal a Marvel Knights Hero", 'Revealed a Marvel Knights Hero', () =>
    gainWound(state, ui),
  )
})

registerCardAbility('secret-wars-2-zheng-zhu-humble-the-pretenders', async (state, { ui }) => {
  const heroes = revealCards(state).filter((card) => hasTeamHero(state, card, 'marvel-knights'))
  await revealOneOr(ui, heroes, 'Humble the Pretenders: reveal a Marvel Knights Hero', 'Revealed a Marvel Knights Hero', async () => {
    const cheap = state.hand.filter((card) => (getCardData(state, card).cost ?? 0) < 7)
    const chosen = await chooseOneCard(ui, cheap, 'Humble the Pretenders: discard a card that costs less than 7')
    if (chosen) await discardCard(state, chosen.instanceId, ui)
  })
})

// Wybierz dowolną liczbę Bohaterów z HQ i połóż je na spodzie talii Bohaterów w losowej kolejności (spód = początek tablicy)
registerCardAbility('secret-wars-2-zheng-zhu-imperial-edict', async (state, { ui }) => {
  const picked: CardInstance[] = []
  for (;;) {
    const options = state.hq.flatMap((card) =>
      card && getCardData(state, card).hero && !picked.some((p) => p.instanceId === card.instanceId) ? [card] : [],
    )
    if (options.length === 0) break
    const chosen = await ui.choose(options, {
      prompt: 'Imperial Edict: choose a Hero from the HQ to put on the bottom of the Hero Deck, or stop',
      optional: true,
    })
    if (!chosen) break
    picked.push(chosen)
  }
  for (const card of picked) {
    const index = state.hq.findIndex((candidate) => candidate?.instanceId === card.instanceId)
    if (index === -1) continue
    state.hq[index] = null
    returnShardsOn(state, card)
  }
  state.heroDeck.unshift(...shuffle(picked))
  refillHq(state)
})

// ---------- King Hyperion ----------

/** "If King Hyperion is in the city, put him back on the Mastermind space and shuffle this Tactic back into his Tactics."
 * Zwraca true, gdy to zrobiono ("If you do"). */
function hyperionRetreats(state: GameState, tactic: CardInstance): boolean {
  const king = (state.masterminds ?? [state.mastermind]).find((card) => card.cardId === KING_HYPERION.card.id)
  const index = king ? state.city.findIndex((card) => card?.instanceId === king.instanceId) : -1
  if (index === -1) return false
  state.city[index] = null
  returnTacticToPile(state, KING_HYPERION.card.id, tactic)
  logEvent(state, 'King Hyperion returns to the Mastermind space')
  return true
}

registerCardAbility('secret-wars-2-king-hyperion-worshipped-by-millions', async (state, { ui, self }) => {
  if (!hyperionRetreats(state, self)) return
  for (let i = 0; i < 6; i++) await rescueBystander(state, ui)
})

registerCardAbility('secret-wars-2-king-hyperion-royal-treasury', async (state, { self }) => {
  if (hyperionRetreats(state, self)) addRecruit(state, 5)
})

registerCardAbility('secret-wars-2-king-hyperion-monarch-of-utopolis', async (state, { self }) => {
  if (hyperionRetreats(state, self)) state.bonusDrawNextTurn += 3
})

registerCardAbility('secret-wars-2-king-hyperion-rule-with-an-iron-fist', async (state, { ui, self }) => {
  if (hyperionRetreats(state, self)) await defeatCityVillainForFree(state, ui, 'Rule with an Iron Fist', true)
})

// ---------- Shiklah, the Demon Bride ----------

registerCardAbility('secret-wars-2-shiklah-enslavement-beam', async (state, { ui, self }) => {
  if (await fatefulResurrectionTactic(state, ui, self, SHIKLAH_THE_DEMON_BRIDE.card.id)) {
    for (let i = 0; i < 4; i++) await rescueBystander(state, ui)
  }
})

// Gain this as a Hero: Tactic idzie na discard jako Bohater (strona Hero niżej), a combat.ts nie kładzie go już do Victory Pile
const DEADPOOL_TACTIC_ID = 'secret-wars-2-shiklah-shiklahs-husband-deadpool'
const DEADPOOL_HERO_ABILITY_ID = 'secret-wars-2-shiklahs-husband-deadpool-hero'

registerVillainHeroSide(DEADPOOL_TACTIC_ID, {
  attack: 5,
  type: ['covert'],
  team: [],
  text: 'You get +1 Attack for each Hero with an odd-numbered cost you played this turn. (0 is even.)',
  abilityId: DEADPOOL_HERO_ABILITY_ID,
})

registerCardAbility(DEADPOOL_TACTIC_ID, async (state, { self }) => {
  gainVillainWithHeroSide(state, self)
  state.discard.push(self)
  logEvent(state, "Gained Shiklah's Husband, Deadpool as a Hero")
})

registerCardAbility(DEADPOOL_HERO_ABILITY_ID, async (state) => {
  const odd = state.cardsPlayedThisTurn.filter((card) => {
    const data = getCardData(state, card)
    return !!data.hero && (data.cost ?? 0) % 2 === 1
  }).length
  if (odd > 0) addAttack(state, odd)
})

registerCardAbility('secret-wars-2-shiklah-drain-life', async (state, { ui, self }) => {
  if (await fatefulResurrectionTactic(state, ui, self, SHIKLAH_THE_DEMON_BRIDE.card.id)) {
    await defeatCityVillainForFree(state, ui, 'Drain Life', false)
  }
})

registerCardAbility('secret-wars-2-shiklah-infernal-power', async (state, { ui, self }) => {
  if (await fatefulResurrectionTactic(state, ui, self, SHIKLAH_THE_DEMON_BRIDE.card.id)) drawCards(state, 2)
})

// ---------- Spider-Queen ----------

// Odkryj 8 górnych kart talii Villainów: Bystanderzy idą do Escape Pile, reszta na spód w losowej kolejności
registerCardAbility('secret-wars-2-spider-queen-sonic-scream', async (state, { ui }) => {
  const revealed = await revealTopVillainCards(state, ui, 8, 'Sonic Scream: top 8 cards of the Villain Deck')
  const rest: CardInstance[] = []
  for (const card of revealed) {
    if (isBystander(state, card)) state.escapedBystanders.push(card)
    else rest.push(card)
  }
  state.villainDeck.unshift(...shuffle(rest)) // spód talii to początek tablicy
})

// Bystander ze stosu do Escape Pile, potem każdy Spider-Infected w mieście porywa Bystandera
registerCardAbility('secret-wars-2-spider-queen-infect-the-entire-city', async (state, { ui }) => {
  const bystander = state.bystanders.pop()
  if (bystander) state.escapedBystanders.push(bystander)
  for (const infected of state.city.filter((card): card is CardInstance => !!card && isSpiderInfected(state, card))) {
    const captive = state.bystanders.pop()
    if (!captive) return
    state.captives[infected.instanceId] = [...(state.captives[infected.instanceId] ?? []), captive]
    await ui.showCapture(infected, captive, `Bystander captured by ${state.cards[infected.cardId].name}`)
  }
})

registerCardAbility('secret-wars-2-spider-queen-control-arachnid-genes', async (state, { ui }) => {
  const options = state.hq.flatMap((card) => (card && hasTeamHero(state, card, 'spider-friends') ? [card] : []))
  if (options.length === 0) return
  const chosen = await ui.choose(options, { prompt: 'Control Arachnid Genes: gain a Spider Friends Hero from the HQ?', optional: true })
  if (!chosen) return
  const index = state.hq.findIndex((card) => card?.instanceId === chosen.instanceId)
  if (index === -1) return
  state.hq[index] = null
  claimShardsOn(state, chosen)
  state.discard.push(chosen)
  refillHq(state)
})

registerCardAbility('secret-wars-2-spider-queen-web-the-skyscrapers', async (state, { ui }) => {
  const heroes = revealCards(state).filter((card) => hasTeamHero(state, card, 'spider-friends'))
  await revealOneOr(ui, heroes, 'Web the Skyscrapers: reveal a Spider Friends Hero', 'Revealed a Spider Friends Hero', async () => {
    const bystanders = state.defeated.filter((card) => isBystander(state, card))
    const chosen = await chooseOneCard(ui, bystanders, 'Web the Skyscrapers: put a Bystander from your Victory Pile into the Escape pile')
    if (!chosen) return
    state.defeated.splice(state.defeated.findIndex((card) => card.instanceId === chosen.instanceId), 1)
    state.escapedBystanders.push(chosen)
  })
})
