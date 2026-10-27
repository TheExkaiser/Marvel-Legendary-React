import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { getCardAbility } from './cardAbilities'
import { getVillainAbilities } from './villainAbilities'
import { canDefeatVillain } from './villainRequirements'
import { getEffectiveStrength, koCard } from './keywords'
import { getScheme } from './schemeRegistry'
import { assertPlaying, logEvent } from './common'
import { rescueBystander, rescueCard } from './wounds'
import { addRecruit } from './resources'
import { CITY_NAMES } from './constants'
import { drawCards } from './deckOps'
import { asEnemyEffect } from './replacements'
import { gainVillainAsHero } from './cardData'
import { refillHq } from './recruit'
import { getMastermindRule } from './mastermindRules'
import { isCityDestroyed } from './cityLayout'
import { claimShardFrom } from './shards'

/** Czy Recruit płaci za tę kartę jak Attack: God of Thunder (cała tura) albo Bribe (tylko ta karta). */
function recruitPays(state: GameState, cardId: string): boolean {
  return state.recruitCountsAsAttackThisTurn || (state.cards[cardId].keywords ?? []).includes('bribe')
}

const DEMON_GOBLIN_ATTACK = 2

function enemiesCostRecruit(state: GameState): boolean {
  return (
    state.enemiesCostRecruitThisTurn ||
    (getScheme(state).id === 'fantasticfour_pull_reality_into_the_negative_zone' &&
      [2, 4, 6].includes(state.twistsRevealed))
  )
}

function availableAttack(state: GameState, cardId: string): number {
  if (enemiesCostRecruit(state)) return state.recruit
  return state.attack + (recruitPays(state, cardId) ? state.recruit : 0)
}

/** Czy gracza stać na walkę z tym Villainem. Te same warunki co w fightVillain, ale bez wykonywania akcji (podświetlanie w UI). */
export function canAffordVillain(state: GameState, villain: CardInstance): boolean {
  if (state.status !== 'playing') return false
  if (!canDefeatVillain(state, villain.cardId)) return false
  const strength = getEffectiveStrength(state, villain) ?? 0
  return availableAttack(state, villain.cardId) >= strength
}

/** Czy gracza stać na walkę z Mastermindem. Te same warunki co w fightMastermind, ale bez wykonywania akcji (podświetlanie w UI).
 * Gdy reguła Mastermina podaje kilka możliwych sił (Galactus: Cosmic Threat), wystarczy, że stać nas na którąkolwiek. */
export function canAffordMastermind(state: GameState): boolean {
  if (state.status !== 'playing') return false
  const mmId = state.mastermind.cardId
  const strengths =
    getMastermindRule(state)?.fightStrengthOptions?.(state) ?? [getEffectiveStrength(state, state.mastermind) ?? 0]
  const additionalCost = getScheme(state).mastermindFightAdditionalCost?.(state) ?? 0
  const totalAttackOrRecruit = state.attack + state.recruit
  return strengths.some(
    (strength) =>
      availableAttack(state, mmId) >= strength &&
      (additionalCost === 0 || totalAttackOrRecruit >= strength + additionalCost),
  )
}

/** Czy gracza stać na Demon Goblina (te same warunki co w fightDemonGoblin). */
export function canAffordDemonGoblin(state: GameState): boolean {
  if (state.status !== 'playing') return false
  const stack = state.demonGoblins ?? []
  const goblin = stack[stack.length - 1]
  return !!goblin && availableAttack(state, goblin.cardId) >= DEMON_GOBLIN_ATTACK
}

async function spendAttack(state: GameState, amount: number, ui: UiAdapter, cardId: string): Promise<void> {
  if (enemiesCostRecruit(state)) {
    state.recruit -= amount
    return
  }

  if (!recruitPays(state, cardId)) {
    state.attack -= amount
    return
  }

  if (state.attack <= 0 || state.recruit <= 0) {
    const fromAttack = Math.min(state.attack, amount)
    state.attack -= fromAttack
    state.recruit -= amount - fromAttack
    return
  }

  const maxFromAttack = Math.min(amount, state.attack)
  const maxFromRecruit = Math.min(amount, state.recruit)
  const { fromAttack, fromRecruit } = await ui.chooseAttackSplit(amount, maxFromAttack, maxFromRecruit)
  state.attack -= fromAttack
  state.recruit -= fromRecruit
}

/** Ultimate Nullifier: gracz może anulować efekt Fight. Pytamy tylko, gdy efekt faktycznie istnieje. */
async function fightEffectCancelled(state: GameState, ui: UiAdapter, enemy: CardInstance): Promise<boolean> {
  if (!state.cancelFightEffectsThisTurn) return false
  const choice = await ui.chooseOptionWithCard(
    enemy,
    [
      { id: 'cancel', label: 'Anuluj efekt Fight (Ultimate Nullifier)' },
      { id: 'resolve', label: 'Rozpatrz efekt Fight' },
    ],
    'Ultimate Nullifier',
  )
  return choice === 'cancel'
}

async function removeVillainFromCity(state: GameState, index: number, ui: UiAdapter): Promise<void> {
  const villain = state.city[index]!
  const location = CITY_NAMES[index]
  state.city[index] = null
  claimShardFrom(state, villain) // jeden Shard dla gracza, reszta do zapasu
  addRecruit(state, state.defeatRecruitBonus ?? 0)
  for (let i = 0; i < (state.defeatRescueBonus ?? 0); i++) await rescueBystander(state, ui)

  const scheme = getScheme(state)
  const captives = state.captives[villain.instanceId] ?? []
  const rescued = scheme.onCaptivesRescued?.(state, villain, captives) ?? captives
  delete state.captives[villain.instanceId]
  delete state.attachedCards[villain.instanceId]

  // Burrow: bonusy za pokonanie działają, ale Villain wraca do Streets zamiast do Victory Pile (bez Ambush)
  const burrows = state.burrowingVillainId === villain.instanceId
  state.burrowingVillainId = undefined
  const streetsIndex = CITY_NAMES.indexOf('Streets')

  if (burrows && !isCityDestroyed(state, streetsIndex) && state.city[streetsIndex] === null) {
    state.city[streetsIndex] = villain
  } else if (scheme.onVillainDefeated) {
    scheme.onVillainDefeated(state, villain)
  } else {
    state.defeated.push(villain)
  }
  // Jeńcy uratowani przez pokonanie Villaina: każdy osobno (popup, bonusy "rescue", zdolność Bystandera)
  for (const card of rescued) await rescueCard(state, card, ui)

  // Bonusy za pokonanie Villaina w konkretnych lokacjach (Night Hunter, Nowhere to Hide)
  for (const bonus of state.locationDefeatBonuses ?? []) {
    if (!bonus.locations.includes(location)) continue
    if (bonus.recruit) addRecruit(state, bonus.recruit)
    if (bonus.draw) drawCards(state, bonus.draw)
    for (let i = 0; i < (bonus.rescue ?? 0); i++) await rescueBystander(state, ui)
  }

  if (location === 'Rooftops') {
    if ((state.rooftopsRescueVpBonus ?? 0) > 0) {
      for (let i = 0; i < (state.cards[villain.cardId].vp ?? 0); i++) await rescueBystander(state, ui)
      state.rooftopsRescueVpBonus = Math.max(0, (state.rooftopsRescueVpBonus ?? 0) - 1)
    }
    if ((state.rooftopsKoAvailable ?? 0) > 0) {
      state.rooftopsKoAvailable = Math.max(0, (state.rooftopsKoAvailable ?? 0) - 1)
      const chosen = await ui.choose([...state.hand, ...state.discard], {
        prompt: 'Lunar Communion: możesz KO kartę z ręki lub stosu odrzuconych',
        optional: true,
      })
      if (chosen) koCard(state, chosen.instanceId)
    }
  }
}

async function resolveVillainFightEffects(
  state: GameState,
  ui: UiAdapter,
  villain: CardInstance,
): Promise<boolean> {
  const data = state.cards[villain.cardId]
  const abilities = getVillainAbilities(villain.cardId)
  // Feast is a generic Fight effect. The card may have no additional onFeast
  // hook (for example Demogoblin), but it must still KO the top card.
  if (!abilities?.onFight && !(data.keywords ?? []).includes('feast')) return true
  if (await fightEffectCancelled(state, ui, villain)) return false

  await asEnemyEffect(state, async () => {
    if ((data.keywords ?? []).includes('feast')) {
      const feasted = state.deck.pop()
      if (feasted) {
        state.ko.push(feasted)
        await ui.revealCard(feasted, `${data.name} feasts on ${state.cards[feasted.cardId].name}`)
        await abilities?.onFeast?.(state, ui, villain, feasted)
      }
    }
    await abilities?.onFight?.(state, ui, villain)
  })
  return true
}

/** Mind Control (Professor X): zdobywasz pokonanego Villaina. Idzie do Twoich odrzuconych jak kupiona karta
 * i działa jak Bohater z Attack równym swojej sile. Działa przy każdym pokonaniu (walka, za darmo, z talii). */
async function offerMindControl(state: GameState, villain: CardInstance, ui: UiAdapter): Promise<void> {
  if (!state.mindControlThisTurn) return

  // Jeśli scheme przejął kartę (onVillainDefeated), nie ma jej w Victory Pile i nie ma czego zdobywać
  const pileIndex = state.defeated.findIndex((c) => c.instanceId === villain.instanceId)
  if (pileIndex === -1) return

  const data = state.cards[villain.cardId]
  const chosen = await ui.choose([villain], {
    prompt: `Mind Control: zdobyć ${data.name} jako Bohatera (+${data.strength ?? 0} Attack)?`,
    optional: true,
  })
  if (!chosen) return

  state.defeated.splice(pileIndex, 1)
  state.discard.push(villain)
  gainVillainAsHero(state, villain)
}

/** Villain z wierzchu talii złoczyńców (Telepathic Probe, Hail of Bullets): zdejmuje go i pokonuje.
 * payAttack = true: płaci Attack (zwraca false, gdy za mało); false: pokonanie za darmo. */
export async function defeatVillainFromDeck(
  state: GameState,
  ui: UiAdapter,
  payAttack: boolean,
): Promise<boolean> {
  assertPlaying(state)
  const villain = state.villainDeck[state.villainDeck.length - 1]
  if (!villain) return false
  if (!canDefeatVillain(state, villain.cardId)) return false

  if (payAttack) {
    const strength = getEffectiveStrength(state, villain) ?? 0
    if (availableAttack(state, villain.cardId) < strength) return false
    await spendAttack(state, strength, ui, villain.cardId)
  }

  state.villainDeck.pop()

  await resolveVillainFightEffects(state, ui, villain)
  state.burrowingVillainId = undefined // Villain z talii nie stoi w mieście, więc nie ma gdzie się zakopać

  addRecruit(state, state.defeatRecruitBonus ?? 0)
  for (let i = 0; i < (state.defeatRescueBonus ?? 0); i++) await rescueBystander(state, ui)

  const scheme = getScheme(state)
  if (scheme.onVillainDefeated) {
    scheme.onVillainDefeated(state, villain)
  } else {
    state.defeated.push(villain)
  }

  await scheme.afterVillainDefeated?.(state, villain, ui)

  logEvent(state, `Defeated from Villain Deck: ${state.cards[villain.cardId].name}`)
  await offerMindControl(state, villain, ui)
  return true
}

export async function fightVillain(
  state: GameState,
  instanceId: string,
  ui: UiAdapter,
): Promise<void> {
  assertPlaying(state)
  const cityIndex = state.city.findIndex((c) => c?.instanceId === instanceId)
  const hqIndex = state.hq.findIndex((c) => c?.instanceId === instanceId)
  const scheme = getScheme(state)
  const hqCard = hqIndex === -1 ? undefined : state.hq[hqIndex]
  const isHqVillain = cityIndex === -1 && hqIndex !== -1 && scheme.canFightVillainsInHq === true &&
    !!hqCard && (state.cards[hqCard.cardId].villainGroup !== undefined || state.cards[hqCard.cardId].henchman === true)
  if (cityIndex === -1 && !isHqVillain) throw new Error(`Złoczyńcy ${instanceId} nie ma w mieście`)

  const villain = isHqVillain ? state.hq[hqIndex]! : state.city[cityIndex]!
  if (!canDefeatVillain(state, villain.cardId)) {
    throw new Error('Nie możesz teraz pokonać tego złoczyńcy (niespełniony warunek)')
  }

  const strength = getEffectiveStrength(state, villain) ?? 0
  if (availableAttack(state, villain.cardId) < strength) {
    throw new Error(`Za mało attack: masz ${availableAttack(state, villain.cardId)}, siła ${strength}`)
  }

  await spendAttack(state, strength, ui, villain.cardId)

  await resolveVillainFightEffects(state, ui, villain)

  if (state.returnVillainToCity?.instanceId === villain.instanceId) {
    const returnIndex = state.returnVillainToCity.cityIndex
    state.returnVillainToCity = undefined
    state.city[returnIndex] = villain
    logEvent(state, `Feast returned: ${state.cards[villain.cardId].name}`)
    return
  }

  if (isHqVillain) {
    state.hq[hqIndex] = null
    claimShardFrom(state, villain)
    const captives = state.captives[villain.instanceId] ?? []
    const rescued = scheme.onCaptivesRescued?.(state, villain, captives) ?? captives
    delete state.captives[villain.instanceId]
    delete state.attachedCards[villain.instanceId]
    if (scheme.onVillainDefeated) scheme.onVillainDefeated(state, villain)
    else state.defeated.push(villain)
    for (const card of rescued) await rescueCard(state, card, ui)
    refillHq(state)
    await scheme.afterVillainDefeated?.(state, villain, ui)
  } else {
    await removeVillainFromCity(state, cityIndex, ui)
    await scheme.afterVillainDefeated?.(state, villain, ui)
  }
  logEvent(state, `Defeated: ${state.cards[villain.cardId].name}`)
  await offerMindControl(state, villain, ui)
}

export async function defeatVillainFree(state: GameState, instanceId: string, ui: UiAdapter): Promise<void> {
  const index = state.city.findIndex((c) => c?.instanceId === instanceId)
  if (index === -1) throw new Error(`Złoczyńcy ${instanceId} nie ma w mieście`)

  const villain = state.city[index]!
  if (!canDefeatVillain(state, villain.cardId)) {
    throw new Error('Nie możesz teraz pokonać tego złoczyńcy (niespełniony warunek)')
  }

  await removeVillainFromCity(state, index, ui)
  await getScheme(state).afterVillainDefeated?.(state, villain, ui)
  logEvent(state, `Defeated for free: ${state.cards[villain.cardId].name}`)
  await offerMindControl(state, villain, ui)
}

async function claimTactic(state: GameState, ui: UiAdapter): Promise<void> {
  const tactic = state.tactics.pop()
  if (!tactic) throw new Error('Mastermind jest już pokonany')

  await ui.showInfo(tactic, `Odkryto taktykę: ${state.cards[tactic.cardId].name}`)

  const abilityId = state.mysterioTacticIds?.includes(tactic.instanceId)
    ? 'mysterio-master-strike-tactic'
    : tactic.cardId
  const ability = getCardAbility(abilityId)
  if (ability && !(await fightEffectCancelled(state, ui, tactic))) {
    await asEnemyEffect(state, () => ability(state, { self: tactic, ui }))
  }

  const returned = state.tactics.some((t) => t.instanceId === tactic.instanceId)
  if (!returned) state.defeated.push(tactic)

  logEvent(state, `Tactic claimed: ${state.cards[tactic.cardId].name}`)

  addRecruit(state, state.defeatRecruitBonus ?? 0)
  for (let i = 0; i < (state.defeatRescueBonus ?? 0); i++) await rescueBystander(state, ui)
  if (state.tactics.length === 0) {
    state.status = 'won'
  }
}

async function resolveMastermindCaptives(state: GameState, ui: UiAdapter): Promise<void> {
  const mastermind = state.mastermind
  const captives = state.captives[mastermind.instanceId] ?? []
  const scheme = getScheme(state)
  const rescued = scheme.onCaptivesRescued?.(state, mastermind, captives) ?? captives
  delete state.captives[mastermind.instanceId]

  for (const card of rescued) await rescueCard(state, card, ui)
}

export async function fightMastermind(state: GameState, ui: UiAdapter): Promise<void> {
  assertPlaying(state)

  // Cosmic Threat (Galactus): wybór klasy i obniżenie siły na czas tej jednej walki
  const rule = getMastermindRule(state)
  if (rule?.beforeFight && !(await rule.beforeFight(state, ui))) return

  try {
    const strength = getEffectiveStrength(state, state.mastermind) ?? 0
    const mmId = state.mastermind.cardId
    const scheme = getScheme(state)
    const additionalCost = scheme.mastermindFightAdditionalCost?.(state) ?? 0
    const baseAttackAvailable = availableAttack(state, mmId)
    const totalAttackOrRecruit = state.attack + state.recruit
    const canPayBaseCost =
      baseAttackAvailable >= strength &&
      (additionalCost === 0 || totalAttackOrRecruit >= strength + additionalCost)
    if (!canPayBaseCost) {
      throw new Error(`Za mało attack: masz ${availableAttack(state, mmId)}, siła ${strength}`)
    }

    await scheme.beforeMastermindFight?.(state, ui, strength)
    await spendAttack(state, strength, ui, mmId)
    claimShardFrom(state, state.mastermind) // najpierw Shard dla gracza, dopiero potem Fight taktyki (może dać Mastermindowi nowe)
    await claimTactic(state, ui)
    await resolveMastermindCaptives(state, ui)
  } finally {
    state.cosmicThreatReduction = 0
  }
}

export async function claimTacticFree(state: GameState, ui: UiAdapter): Promise<void> {
  await claimTactic(state, ui)
}

/** Transform Citizens Into Demons: za 2 Attack ratujesz wierzchniego Demon Goblina ze stosu obok schematu. */
export async function fightDemonGoblin(state: GameState, ui: UiAdapter): Promise<void> {
  assertPlaying(state)
  const stack = state.demonGoblins ?? []
  const goblin = stack[stack.length - 1]
  if (!goblin) throw new Error('Nie ma Demon Goblinów do pokonania')

  if (availableAttack(state, goblin.cardId) < DEMON_GOBLIN_ATTACK) {
    throw new Error(`Za mało attack: masz ${availableAttack(state, goblin.cardId)}, siła ${DEMON_GOBLIN_ATTACK}`)
  }

  await spendAttack(state, DEMON_GOBLIN_ATTACK, ui, goblin.cardId)
  stack.pop()
  logEvent(state, `Defeated: ${state.cards[goblin.cardId].name}`)

  // Demon Goblin jest Villainem, więc działają bonusy "za pokonanie Villaina" (bez lokacji, bo stoi poza miastem)
  addRecruit(state, state.defeatRecruitBonus ?? 0)
  for (let i = 0; i < (state.defeatRescueBonus ?? 0); i++) await rescueBystander(state, ui)

  // Uratowany jako Bystander: trafia do Victory Pool i liczy się jako "rescue" (Jean Grey itp.)
  await rescueCard(state, goblin, ui)
}
