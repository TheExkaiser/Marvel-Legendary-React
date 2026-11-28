import { getCardAbility, registerCardAbility } from '../../../engine/cardAbilities'
import { canPayAttackCost, defeatVillainFree, defeatVillainFromDeck, payAttackCost, registerLocationDefeatHook } from '../../../engine/combat'
import { adjacentCityIndexes } from '../../../engine/cityLayout'
import { CITY_NAMES } from '../../../engine/constants'
import { getCardData } from '../../../engine/cardData'
import { logEvent } from '../../../engine/common'
import { drawCards, drawRevealed, putCardsOnTop, registerShuffleHook, revealTopAndDrawIf, revealTopCard, shuffleDiscardIntoDeck, takeTopCards } from '../../../engine/deckOps'
import {
  countBystandersInPile,
  countDistinctTeams,
  countPlayedThisTurn,
  discardCard,
  discardCardChecked,
  haveZone,
  isShieldHero,
  isVillainCard,
  koCard,
  koFromVictoryPile,
  revealTopCards,
} from '../../../engine/keywords'
import { emptyAdjacentCityPairs, patrolCitySpace } from '../../../engine/patrol'
import { chooseOneCard } from '../../../engine/abilityHelpers'
import { registerPlayRequirement } from '../../../engine/cardRequirements'
import { crossDimensionalRampage } from '../../../engine/rampage'
import { shuffle } from '../../../engine/random'
import { refillHq } from '../../../engine/recruit'
import { registerDiscardReplacement, registerWoundReplacement } from '../../../engine/replacements'
import { claimShardsOn } from '../../../engine/shards'
import { teleportCard } from '../../../engine/turn'
import { addAttack, addRecruit } from '../../../engine/resources'
import { canUseSpectrum } from '../../../engine/spectrum'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'
import { canDefeatVillain } from '../../../engine/villainRequirements'
import { revealTopVillainCards } from '../../../engine/villainPhase'
import { gainWound, rescueBystander, rescueCard } from '../../../engine/wounds'

// "You may KO a card from your hand or discard pile": zwraca true, jeśli gracz KO-wał kartę
async function koFromHandOrDiscard(state: GameState, ui: UiAdapter, prompt: string): Promise<boolean> {
  const chosen = await ui.choose([...state.hand, ...state.discard], { prompt, optional: true })
  if (!chosen) return false
  koCard(state, chosen.instanceId)
  return true
}

// ---------- Agent Venom ----------

// Spectrum: +1 Recruit i +1 Attack
registerCardAbility('secret-wars-2-agent-venom-multi-gun', async (state) => {
  if (!canUseSpectrum(state)) return
  addRecruit(state, 1)
  addAttack(state, 1)
})

// Patrol the Bank: puste = +2 Recruit, zajęte = +2 Attack (Wall-Crawl obsługuje recruit.ts)
registerCardAbility('secret-wars-2-agent-venom-government-payroll', async (state) => {
  const patrol = patrolCitySpace(state, 'Bank')
  if (patrol === 'empty') {
    logEvent(state, 'Patrol the Bank: empty')
    addRecruit(state, 2)
  } else if (patrol === 'occupied') {
    logEvent(state, 'Patrol the Bank: not empty')
    addAttack(state, 2)
  }
})

// Patrol the Sewers: puste = dobierz kartę
registerCardAbility('secret-wars-2-agent-venom-big-slimeportunity', async (state) => {
  if (patrolCitySpace(state, 'Sewers') !== 'empty') return
  logEvent(state, 'Patrol the Sewers: empty')
  drawCards(state, 1)
})

// Za każdą INNĄ kartę zagraną w tej turze z ikoną Recruit +1 Recruit, z ikoną Attack +1 Attack
// (karta z obiema ikonami daje oba bonusy). Ikona = drukowana wartość (0+ też ją ma), jak hasIcon w Vol. 1.
// Podczas zdolności ta karta nie jest jeszcze w cardsPlayedThisTurn, więc nie liczy samej siebie.
registerCardAbility('secret-wars-2-agent-venom-shapeshifting-symbiote', async (state) => {
  const played = state.cardsPlayedThisTurn.map((card) => getCardData(state, card))
  const recruit = played.filter((data) => data.recruit !== undefined).length
  const attack = played.filter((data) => data.attack !== undefined).length
  if (recruit > 0) addRecruit(state, recruit)
  if (attack > 0) addAttack(state, attack)
})

// ---------- Arkon the Magnificent ----------

// Patrol the Sewers: puste = +1 Recruit (Wall-Crawl obsługuje recruit.ts)
registerCardAbility('secret-wars-2-arkon-the-magnificent-all-terrain-barbarian', async (state) => {
  if (patrolCitySpace(state, 'Sewers') !== 'empty') return
  logEvent(state, 'Patrol the Sewers: empty')
  addRecruit(state, 1)
})

// Spectrum: dobierz kartę
registerCardAbility('secret-wars-2-arkon-the-magnificent-quiver-of-thunderbolts', async (state) => {
  if (!canUseSpectrum(state)) return
  drawCards(state, 1)
})

// Patrol two adjacent city spaces: jeśli obie są puste, +1 Attack.
// Gracz i tak wybrałby parę pustych pól (nic nie traci), więc wystarczy sprawdzić, czy taka para istnieje.
registerCardAbility('secret-wars-2-arkon-the-magnificent-warlord-of-open-spaces', async (state) => {
  if (emptyAdjacentCityPairs(state).length === 0) return
  logEvent(state, 'Patrol two adjacent city spaces: both empty')
  addAttack(state, 1)
})

// Patrol the Rooftops: puste = +4 Recruit i +4 Attack, zajęte = pokonaj tego Villaina za darmo
registerCardAbility('secret-wars-2-arkon-the-magnificent-lord-of-dragons', async (state, { ui }) => {
  const patrol = patrolCitySpace(state, 'Rooftops')
  if (patrol === 'empty') {
    logEvent(state, 'Patrol the Rooftops: empty')
    addRecruit(state, 4)
    addAttack(state, 4)
    return
  }
  if (patrol !== 'occupied') return
  const villain = state.city[CITY_NAMES.indexOf('Rooftops')]
  if (!villain) return
  logEvent(state, 'Patrol the Rooftops: not empty')
  if (!canDefeatVillain(state, villain.cardId)) return
  await defeatVillainFree(state, villain.instanceId, ui)
})

// ---------- Beast ----------

registerCardAbility('secret-wars-2-beast-balanced-attack', async (state, { ui }) => {
  await revealTopAndDrawIf(
    state,
    ui,
    (card) => {
      const type = state.cards[card.cardId].type ?? []
      return type.includes('tech') || type.includes('strength')
    },
    'Balanced Attack: revealed the top card of your deck',
  )
})

// Patrol any city space: jeśli jest puste, Bohater w HQ pod nim kosztuje 3 mniej w tej turze.
// Gracz wybiera Bohatera z HQ stojącego pod pustym polem miasta (pole HQ o indeksie i leży pod CITY_NAMES[i]).
registerCardAbility('secret-wars-2-beast-upside-down-thinking', async (state, { ui }) => {
  const targets = state.hq.flatMap((card, index) =>
    card && state.cards[card.cardId].hero && patrolCitySpace(state, CITY_NAMES[index]) === 'empty' ? [card] : [],
  )
  if (targets.length === 0) return
  const chosen = await ui.choose(targets, {
    prompt: 'Upside-down Thinking: choose a Hero in the HQ under an empty city space (it costs 3 less this turn)',
    optional: true,
  })
  if (!chosen) return
  state.hqCardCostReductionsThisTurn = {
    ...state.hqCardCostReductionsThisTurn,
    [chosen.instanceId]: (state.hqCardCostReductionsThisTurn?.[chosen.instanceId] ?? 0) + 3,
  }
  logEvent(state, `Upside-down Thinking: ${state.cards[chosen.cardId].name} costs 3 less this turn`)
})

// +1 Attack za każdą inną zagraną kartę strength i osobno +1 za każdą inną zagraną kartę tech (strength + tech daje oba)
registerCardAbility('secret-wars-2-beast-doctor-of-beatdown', async (state) => {
  const bonus = countPlayedThisTurn(state, { type: 'strength' }) + countPlayedThisTurn(state, { type: 'tech' })
  if (bonus > 0) addAttack(state, bonus)
})

// strength, strength, tech, tech: wymaga co najmniej dwóch innych zagranych kart każdego typu (jak Cosmic Energies w Vol. 1)
registerCardAbility('secret-wars-2-beast-multi-variable-smackulus', async (state) => {
  if (countPlayedThisTurn(state, { type: 'strength' }) >= 2 && countPlayedThisTurn(state, { type: 'tech' }) >= 2) {
    drawCards(state, 3)
  }
})

// ---------- Black Swan ----------

// ranged: odkryj wierzch talii Villainów. Scheme Twist = +2 Attack (zostaje na wierzchu), inna karta wraca na wierzch albo na spód
registerCardAbility('secret-wars-2-black-swan-apocalyptic-vision', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'ranged' }) === 0) return
  const [card] = await revealTopVillainCards(state, ui, 1, 'Apocalyptic Vision: top card of the Villain Deck')
  if (!card) return
  if (state.cards[card.cardId].kind === 'twist') {
    state.villainDeck.push(card)
    addAttack(state, 2)
    return
  }
  const choice = await ui.chooseOption(
    [{ id: 'top', label: 'Put it back on top' }, { id: 'bottom', label: 'Put it on the bottom' }],
    'Apocalyptic Vision: put the revealed card back on the top or bottom of the Villain Deck?',
  )
  // Wierzch talii Villainów = koniec tablicy, spód = początek
  if (choice === 'bottom') state.villainDeck.unshift(card)
  else state.villainDeck.push(card)
})

// instinct: możesz KO kartę z ręki lub discardu; jeśli to zrobisz, dobierz kartę
registerCardAbility('secret-wars-2-black-swan-witness-the-end', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'instinct' }) === 0) return
  if (await koFromHandOrDiscard(state, ui, 'Witness the End: you may KO a card from your hand or discard pile')) {
    drawCards(state, 1)
  }
})

// Odkryj 3 górne karty talii Villainów, uratuj odkrytych Bystanderów, resztę odłóż (losowa kolejność, jak w Dark City)
registerCardAbility('secret-wars-2-black-swan-dark-foretelling', async (state, { ui }) => {
  const revealed = await revealTopVillainCards(state, ui, 3, 'Dark Foretelling: top 3 cards of the Villain Deck')
  const bystanders = revealed.filter((card) => state.cards[card.cardId].kind === 'bystander')
  state.villainDeck.push(...shuffle(revealed.filter((card) => !bystanders.includes(card))))
  for (const bystander of bystanders) await rescueCard(state, bystander, ui)
})

// Odkryj 5 górnych kart talii Villainów: +Attack równy wydrukowanemu VP jednej z nich (z Cabal: dwóch).
// Gracz i tak wybrałby karty o największym VP, więc bierzemy najwyższe. Karty wracają w losowej kolejności.
registerCardAbility('secret-wars-2-black-swan-telepathic-control', async (state, { ui }) => {
  const revealed = await revealTopVillainCards(state, ui, 5, 'Telepathic Control: top 5 cards of the Villain Deck')
  const points = revealed.map((card) => state.cards[card.cardId].vp ?? 0).sort((a, b) => b - a)
  const cabal = countPlayedThisTurn(state, { team: 'cabal' }) > 0
  addAttack(state, points.slice(0, cabal ? 2 : 1).reduce((sum, vp) => sum + vp, 0))
  state.villainDeck.push(...shuffle(revealed))
})

// ---------- The Captain and the Devil ----------

registerCardAbility('secret-wars-2-the-captain-and-the-devil-jurassic-america', async (state) => {
  if (canUseSpectrum(state)) addRecruit(state, 2)
})

registerCardAbility('secret-wars-2-the-captain-and-the-devil-patriotic-chomp', async (state) => {
  if (canUseSpectrum(state)) addAttack(state, 2)
})

// Patrol the Streets: puste = możesz KO kartę z ręki lub discardu
registerCardAbility('secret-wars-2-the-captain-and-the-devil-feeding-grounds', async (state, { ui }) => {
  if (patrolCitySpace(state, 'Streets') !== 'empty') return
  logEvent(state, 'Patrol the Streets: empty')
  await koFromHandOrDiscard(state, ui, 'Feeding Grounds: you may KO a card from your hand or discard pile')
})

// Whenever you defeat a Villain this turn: sąsiedzi pokonanego Villaina w mieście i Mastermind (sąsiad Bridge) dostają -2 Attack w tej turze.
// Hook odpala się dla każdej zagranej kopii karty, więc dwie kopie sumują się.
registerLocationDefeatHook('secret-wars-2-the-captain-and-the-devil-dino-roar-of-triumph', async (state, _ui, location) => {
  const index = CITY_NAMES.indexOf(location)
  if (index === -1) return
  for (const adjacent of adjacentCityIndexes(state, index)) {
    const name = CITY_NAMES[adjacent]
    state.locationAttackModifiers[name] = (state.locationAttackModifiers[name] ?? 0) - 2
  }
  if (location === 'Bridge') state.mastermindAttackModifierThisTurn -= 2
})

// ---------- Captain Britain ----------

// "Heroes you have" = haveZone tylko z Bohaterami (jak Ultimate Captain America w Vol. 1)
const heroTeamIcons = (state: GameState): number =>
  countDistinctTeams(state, haveZone(state).filter((card) => !!getCardData(state, card).hero))

registerCardAbility('secret-wars-2-captain-britain-combined-strength', async (state) => {
  addAttack(state, heroTeamIcons(state))
})

registerCardAbility('secret-wars-2-captain-britain-transatlantic-savior', async (state) => {
  addRecruit(state, heroTeamIcons(state))
})

// Patrol the Rooftops: puste = odkryj 2 górne karty talii. Różne ikony drużyn = dobierz je, inaczej odłóż (oryginalna kolejność, bez UI wyboru, jak w Core Set).
// "Różne ikony" = obie karty mają drużynę i nie mają wspólnej.
registerCardAbility('secret-wars-2-captain-britain-raise-the-union-jack', async (state, { ui }) => {
  if (patrolCitySpace(state, 'Rooftops') !== 'empty') return
  logEvent(state, 'Patrol the Rooftops: empty')
  const revealed = await revealTopCards(state, ui, 2, 'Raise the Union Jack')
  if (revealed.length === 0) return
  const [a, b] = revealed.map((card) => getCardData(state, card).team ?? [])
  const different = revealed.length === 2 && a.length > 0 && b.length > 0 && !a.some((team) => b.includes(team))
  if (different) drawRevealed(state, revealed)
  else putCardsOnTop(state, revealed)
})

// Dodatkowe 3 karty przy dobieraniu nowej ręki na koniec tury (turn.ts, endTurn czyta bonusDrawNextTurn)
registerCardAbility('secret-wars-2-captain-britain-lead-the-captain-britain-corps', async (state) => {
  state.bonusDrawNextTurn += 3
})

// ---------- Corvus Glaive ----------

// KO Bystandera ze stosu Bystanderów (to nie karta gracza, więc bez koRecruitBonus).
// Special Bystander = Bystander z zarejestrowaną zdolnością; jego Rescue effect można wtedy użyć.
registerCardAbility('secret-wars-2-corvus-glaive-culling-blade', async (state, { ui }) => {
  const bystander = state.bystanders.pop()
  if (!bystander) return
  state.ko.push(bystander)
  await ui.showInfo(bystander, 'Culling Blade: KO a Bystander from the Bystander Deck')
  const rescueEffect = getCardAbility(bystander.cardId)
  if (!rescueEffect) return
  const use = await ui.choose([bystander], {
    prompt: `Culling Blade: use the Rescue effect of ${state.cards[bystander.cardId].name}?`,
    optional: true,
  })
  if (use) await rescueEffect(state, { self: bystander, ui })
})

// Patrol the Escape Pile: Bystanderzy w Escape Pile leżą w state.escapedBystanders
registerCardAbility('secret-wars-2-corvus-glaive-let-none-escape-you', async (state) => {
  if (state.escapedBystanders.length === 0) {
    logEvent(state, 'Patrol the Escape Pile: no Bystanders')
    addAttack(state, 2)
  } else {
    logEvent(state, 'Patrol the Escape Pile: Bystanders inside')
    addRecruit(state, 2)
  }
})

// Cabal: KO Bystandera ze stosu, potem +1 Attack za każdych czterech Bystanderów w KO Pile (razem z właśnie wyrzuconym)
registerCardAbility('secret-wars-2-corvus-glaive-rictus-grin', async (state) => {
  if (countPlayedThisTurn(state, { team: 'cabal' }) === 0) return
  const bystander = state.bystanders.pop()
  if (bystander) state.ko.push(bystander)
  const bonus = Math.floor(countBystandersInPile(state, state.ko) / 4)
  if (bonus > 0) addAttack(state, bonus)
})

// Cabal: możesz KO Bystandera z Escape Pile i z Victory Pile (jeden gracz), +1 Attack za każdego
registerCardAbility('secret-wars-2-corvus-glaive-atom-splitting-glaive', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { team: 'cabal' }) === 0) return
  let koed = 0

  if (state.escapedBystanders.length > 0) {
    const chosen = await ui.choose(state.escapedBystanders, {
      prompt: 'Atom-Splitting Glaive: KO a Bystander from the Escape Pile?',
      optional: true,
    })
    const index = chosen ? state.escapedBystanders.findIndex((card) => card.instanceId === chosen.instanceId) : -1
    if (chosen && index !== -1) {
      state.escapedBystanders.splice(index, 1)
      state.ko.push(chosen)
      koed++
    }
  }

  const victoryBystanders = state.defeated.filter((card) => state.cards[card.cardId].kind === 'bystander')
  if (victoryBystanders.length > 0) {
    const chosen = await ui.choose(victoryBystanders, {
      prompt: 'Atom-Splitting Glaive: KO a Bystander from your Victory Pile?',
      optional: true,
    })
    if (chosen) {
      koFromVictoryPile(state, chosen.instanceId)
      koed++
    }
  }

  if (koed > 0) addAttack(state, koed)
})

// ---------- Dr. Punisher, Soldier Supreme ----------

registerCardAbility('secret-wars-2-dr-punisher-soldier-supreme-sweep-the-streets-of-trash', async (state) => {
  if (patrolCitySpace(state, 'Streets') !== 'empty') return
  logEvent(state, 'Patrol the Streets: empty')
  drawCards(state, 1)
})

// tech: odkryj wierzch własnej talii; jeśli kosztuje 0 (karta bez kosztu, np. Wound, liczy się jako 0), KO ją i +1 Attack
registerCardAbility('secret-wars-2-dr-punisher-soldier-supreme-youre-a-slow-learner', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'tech' }) === 0) return
  const top = await revealTopCard(state, ui, "You're a Slow Learner: revealed the top card of your deck")
  if (!top || (getCardData(state, top).cost ?? 0) !== 0) return
  koCard(state, top.instanceId)
  addAttack(state, 1)
})

// Odkryj wierzch talii Villainów. Jeśli to Villain, możesz z nim walczyć w tej turze (jak Fight the Future w Vol. 1:
// decyzja od razu, za aktualny Attack). ranged, ranged (dwie inne zagrane karty ranged): +Attack równy wydrukowanemu VP,
// dodawany PRZED decyzją o walce, żeby można go było wydać na ten pojedynek.
registerCardAbility('secret-wars-2-dr-punisher-soldier-supreme-ice-magic', async (state, { ui }) => {
  const villain = state.villainDeck[state.villainDeck.length - 1]
  if (!villain) return
  const data = state.cards[villain.cardId]
  await ui.showInfo(villain, 'Ice Magic: revealed the top card of the Villain Deck')
  if (!isVillainCard(data)) return

  if (countPlayedThisTurn(state, { type: 'ranged' }) >= 2) addAttack(state, data.vp ?? 0)
  const chosen = await ui.choose([villain], {
    prompt: `Ice Magic: fight ${data.name} this turn?`,
    optional: true,
  })
  if (chosen && !(await defeatVillainFromDeck(state, ui, true))) {
    await ui.showInfo(villain, 'Ice Magic: not enough Attack to defeat this Villain')
  }
})

// Patrol every city space: +1 Attack za każde puste (istniejące) pole
registerCardAbility('secret-wars-2-dr-punisher-soldier-supreme-calm-before-the-storm', async (state) => {
  const empty = CITY_NAMES.filter((name) => patrolCitySpace(state, name) === 'empty').length
  logEvent(state, `Patrol every city space: ${empty} empty`)
  if (empty > 0) addAttack(state, empty)
})

// ---------- Elsa Bloodstone ----------

registerCardAbility('secret-wars-2-elsa-bloodstone-bloodstone-pendant', async (state, { ui }) => {
  if (!canUseSpectrum(state)) return
  if (await koFromHandOrDiscard(state, ui, 'Bloodstone Pendant: you may KO a card from your hand or discard pile')) {
    addRecruit(state, 1)
  }
})

registerCardAbility('secret-wars-2-elsa-bloodstone-monster-hunter', async (state, { ui }) => {
  if (patrolCitySpace(state, 'Sewers') !== 'empty') return
  logEvent(state, 'Patrol the Sewers: empty')
  await rescueBystander(state, ui)
})

// +1 Attack za każdego innego zagranego Bohatera S.H.I.E.L.D. (także szare Agenty i Troopery, bo isShieldHero je obejmuje)
registerCardAbility('secret-wars-2-elsa-bloodstone-defend-the-shield-wall', async (state) => {
  const count = state.cardsPlayedThisTurn.filter((card) => {
    const data = getCardData(state, card)
    return !!data.hero && isShieldHero(data)
  }).length
  if (count > 0) addAttack(state, count)
})

registerCardAbility('secret-wars-2-elsa-bloodstone-prodigy-of-ulysses-bloodstone', async (state) => {
  if (canUseSpectrum(state)) addAttack(state, 3)
})

// ---------- Phoenix Force Cyclops ----------

// Możesz KO tę kartę; jeśli to zrobisz, +2 Attack
registerCardAbility('secret-wars-2-phoenix-force-cyclops-burn-out', async (state, { ui, self }) => {
  const chosen = await ui.choose([self], { prompt: 'Burn Out: KO this card to get +2 Attack?', optional: true })
  if (!chosen) return
  koCard(state, self.instanceId)
  addAttack(state, 2)
})

// KO tej karty, potem zdobądź Bohatera kosztującego do 4 ze stosu S.H.I.E.L.D. Officerów lub z HQ i weź go do ręki
registerCardAbility('secret-wars-2-phoenix-force-cyclops-reincarnate', async (state, { ui, self }) => {
  koCard(state, self.instanceId)
  const officer = state.officerDeck[state.officerDeck.length - 1]
  const options: CardInstance[] = []
  if (officer && (state.cards[officer.cardId].cost ?? 0) <= 4) options.push(officer)
  for (const card of state.hq) {
    if (card && state.cards[card.cardId].hero && (state.cards[card.cardId].cost ?? 0) <= 4) options.push(card)
  }
  const chosen = await chooseOneCard(ui, options, 'Reincarnate: gain a Hero that costs 4 or less and put it into your hand')
  if (!chosen) return
  if (officer && chosen.instanceId === officer.instanceId) {
    state.officerDeck.pop()
  } else {
    const index = state.hq.findIndex((card) => card?.instanceId === chosen.instanceId)
    if (index < 0) return
    state.hq[index] = null
    claimShardsOn(state, chosen)
    refillHq(state)
  }
  state.hand.push(chosen)
  logEvent(state, `Reincarnate: gained ${state.cards[chosen.cardId].name} into hand`)
})

// Zdobądź Bohatera, który został KO'd w tej turze (KO Pile minus stan z początku tury, zapisywany w endTurn)
registerCardAbility('secret-wars-2-phoenix-force-cyclops-rise-from-the-ashes', async (state, { ui }) => {
  const before = new Set(state.koPileAtTurnStart ?? [])
  const candidates = state.ko.filter((card) => !before.has(card.instanceId) && !!state.cards[card.cardId].hero)
  const chosen = await chooseOneCard(ui, candidates, "Rise from the Ashes: gain a Hero that was KO'd this turn")
  if (!chosen) return
  const index = state.ko.findIndex((card) => card.instanceId === chosen.instanceId)
  if (index === -1) return
  state.ko.splice(index, 1)
  state.discard.push(chosen)
  logEvent(state, `Rise from the Ashes: gained ${state.cards[chosen.cardId].name}`)
})

// KO do trzech kart z ręki, dobierz tyle kart
registerCardAbility('secret-wars-2-phoenix-force-cyclops-destruction-is-creation', async (state, { ui }) => {
  let koed = 0
  for (let i = 0; i < 3 && state.hand.length > 0; i++) {
    const chosen = await ui.choose(state.hand, {
      prompt: `Destruction Is Creation: KO a card from your hand (${i + 1}/3), or stop`,
      optional: true,
    })
    if (!chosen) break
    koCard(state, chosen.instanceId)
    koed++
  }
  if (koed > 0) drawCards(state, koed)
})

// ---------- Ruby Summers ----------

function removeFromHandOrPlayed(state: GameState, instanceId: string): CardInstance | undefined {
  for (const pile of [state.hand, state.played]) {
    const index = pile.findIndex((card) => card.instanceId === instanceId)
    if (index !== -1) return pile.splice(index, 1)[0]
  }
  return undefined
}

// Gdy efekt karty każe ją odrzucić: w Twojej turze Teleport, w fazie Villaina (nie Twoja tura) odłożenie na bok do końca tej fazy
registerDiscardReplacement('secret-wars-2-ruby-summers-guerrilla-warfare', async (state, ui, self) => {
  if (state.villainPhaseActive) {
    const card = removeFromHandOrPlayed(state, self.instanceId)
    if (!card) return false
    state.setAsideUntilVillainPhaseEnds = [...(state.setAsideUntilVillainPhaseEnds ?? []), card]
    logEvent(state, 'Guerrilla Warfare: set aside, returns to your hand at the end of this turn')
    return true
  }
  if (state.hand.some((card) => card.instanceId === self.instanceId)) {
    await teleportCard(state, self.instanceId, ui, true)
    return true
  }
  const card = removeFromHandOrPlayed(state, self.instanceId)
  if (!card) return false
  state.teleported = [...(state.teleported ?? []), card]
  logEvent(state, 'Teleported: Guerrilla Warfare')
  return true
})

// "To play this card, you must discard N cards from your hand": wymóg sprawdzany przed zagraniem (karta sama jest jeszcze w ręce),
// odrzucenie robi zdolność, tak jak Cyclops w Core Set
async function discardAsPlayCost(state: GameState, ui: UiAdapter, count: number, source: string): Promise<void> {
  for (let i = 0; i < count && state.hand.length > 0; i++) {
    const chosen = await ui.choose(state.hand, {
      prompt: `${source}: discard a card from your hand (${i + 1}/${count})`,
      optional: false,
    })
    if (chosen) await discardCard(state, chosen.instanceId, ui)
  }
}

registerPlayRequirement('secret-wars-2-ruby-summers-heir-to-legends', (state) => state.hand.length >= 2)
registerCardAbility('secret-wars-2-ruby-summers-heir-to-legends', async (state, { ui }) => {
  await discardAsPlayCost(state, ui, 1, 'Heir to Legends')
})

// X-Men: do końca tury +2 Recruit za każdego pokonanego Villaina lub Mastermind (istniejący defeatRecruitBonus)
registerCardAbility('secret-wars-2-ruby-summers-form-of-solid-ruby', async (state) => {
  if (countPlayedThisTurn(state, { team: 'x-men' }) === 0) return
  state.defeatRecruitBonus = (state.defeatRecruitBonus ?? 0) + 2
})

registerPlayRequirement('secret-wars-2-ruby-summers-extinction-blast', (state) => state.hand.length >= 4)
registerCardAbility('secret-wars-2-ruby-summers-extinction-blast', async (state, { ui }) => {
  await discardAsPlayCost(state, ui, 3, 'Extinction Blast')
})

// ---------- Shang-Chi ----------

// instinct: możesz przetasować stos odrzuconych z talią
registerCardAbility('secret-wars-2-shang-chi-shuffling-footwork', async (state, { ui, self }) => {
  if (countPlayedThisTurn(state, { type: 'instinct' }) === 0) return
  if (state.discard.length === 0) return
  const chosen = await ui.choose([self], { prompt: 'Shuffling Footwork: shuffle your discard pile into your deck?', optional: true })
  if (chosen) shuffleDiscardIntoDeck(state)
})

registerCardAbility('secret-wars-2-shang-chi-acrobatic-kung-fu', async (state) => {
  if (patrolCitySpace(state, 'Rooftops') !== 'empty') return
  logEvent(state, 'Patrol the Rooftops: empty')
  addAttack(state, 1)
})

// Patrol your discard pile: puste = +2 Attack (grana karta leży w played, nie w discardzie)
registerCardAbility('secret-wars-2-shang-chi-seek-the-empty-mind', async (state) => {
  if (state.discard.length > 0) return
  logEvent(state, 'Patrol your discard pile: empty')
  addAttack(state, 2)
})

// Po każdym tasowaniu talii z tą kartą w środku kładziemy ją na wierzch (talia = koniec tablicy).
// "You may" upraszczamy do "zawsze": tasowanie dzieje się w synchronicznych funkcjach silnika, bez miejsca na UI.
registerShuffleHook('secret-wars-2-shang-chi-muscle-memory', (state, card) => {
  const index = state.deck.findIndex((candidate) => candidate.instanceId === card.instanceId)
  if (index === -1) return
  state.deck.splice(index, 1)
  state.deck.push(card)
  logEvent(state, 'Muscle Memory: set aside during the shuffle and put on top of your deck')
})

// ---------- Silk ----------

const costsAtMost = (state: GameState, max: number) => (card: CardInstance) => (state.cards[card.cardId].cost ?? 0) <= max

registerCardAbility('secret-wars-2-silk-long-range-spider-sense', async (state, { ui }) => {
  if (!canUseSpectrum(state)) return
  await revealTopAndDrawIf(state, ui, costsAtMost(state, 2), 'Long-Range Spider-Sense: revealed the top card of your deck')
})

registerCardAbility('secret-wars-2-silk-cascading-maneuver', async (state) => {
  if (canUseSpectrum(state)) drawCards(state, 1)
})

// Spider Friends: odkryj wierzch talii. Koszt 0 = KO, koszt 1 lub 2 = dobierz
registerCardAbility('secret-wars-2-silk-silk-stalking', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { team: 'spider-friends' }) === 0) return
  const top = await revealTopCard(state, ui, 'Silk Stalking: revealed the top card of your deck')
  if (!top) return
  const cost = state.cards[top.cardId].cost ?? 0
  if (cost === 0) koCard(state, top.instanceId)
  else if (cost <= 2) drawCards(state, 1)
})

// Spectrum: odkryj 4 górne karty, dowolne z nich o łącznym koszcie do 2 weź do ręki, resztę odłóż (oryginalna kolejność, bez UI wyboru)
registerCardAbility('secret-wars-2-silk-borrowed-cloaking-device', async (state, { ui }) => {
  if (!canUseSpectrum(state)) return
  const rest = takeTopCards(state, 4)
  if (rest.length > 0) await ui.showCards(rest, 'Borrowed Cloaking Device: revealed cards')
  let budget = 2
  while (rest.length > 0) {
    const options = rest.filter((card) => (state.cards[card.cardId].cost ?? 0) <= budget)
    if (options.length === 0) break
    const chosen = await ui.choose(options, {
      prompt: `Borrowed Cloaking Device: put a card into your hand (total cost left: ${budget}), or stop`,
      optional: true,
    })
    if (!chosen) break
    rest.splice(rest.findIndex((card) => card.instanceId === chosen.instanceId), 1)
    state.hand.push(chosen)
    budget -= state.cards[chosen.cardId].cost ?? 0
  }
  if (rest.length > 0) putCardsOnTop(state, rest)
})

// ---------- Soulsword Colossus ----------

export async function koOneOfYourHeroes(state: GameState, ui: UiAdapter, prompt: string): Promise<void> {
  const heroes = haveZone(state).filter((card) => !!state.cards[card.cardId].hero)
  const chosen = await chooseOneCard(ui, heroes, prompt)
  if (chosen) koCard(state, chosen.instanceId)
}

// covert: raz w turze możesz walczyć z wierzchnim Bystanderem jak z Demonem za 3 Attack z "Fight: KO one of your Heroes".
// Decyzja zapada od razu po zagraniu karty (jak Fight the Future w Vol. 1), więc potrzebny jest już Attack.
// Pokonany Bystander trafia do Victory Pile, a bonusy "za pokonanie Villaina" działają jak przy Demon Goblinie.
registerCardAbility('secret-wars-2-soulsword-colossus-invade-the-inferno', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'covert' }) === 0) return
  const onceKey = 'secret-wars-2-invade-the-inferno'
  if (state.oncePerTurnUsed?.[onceKey]) return
  const bystander = state.bystanders[state.bystanders.length - 1]
  if (!bystander) return
  if (!canPayAttackCost(state, 3, bystander.cardId)) {
    await ui.showInfo(bystander, 'Invade the Inferno: not enough Attack (3 needed) to fight the top Bystander')
    return
  }
  const chosen = await ui.choose([bystander], {
    prompt: 'Invade the Inferno: fight the top Bystander as a 3 Attack Demon Villain ("Fight: KO one of your Heroes")?',
    optional: true,
  })
  if (!chosen) return
  state.oncePerTurnUsed = { ...state.oncePerTurnUsed, [onceKey]: true }
  await payAttackCost(state, 3, ui, bystander.cardId)
  state.bystanders.pop()
  state.defeated.push(bystander)
  logEvent(state, 'Invade the Inferno: defeated the top Bystander as a Demon Villain')
  addRecruit(state, state.defeatRecruitBonus ?? 0)
  for (let i = 0; i < (state.defeatRescueBonus ?? 0); i++) await rescueBystander(state, ui)
  await koOneOfYourHeroes(state, ui, 'Invade the Inferno (Fight): KO one of your Heroes')
})

// Jak Invulnerability z Dark City: zamiast zdobywać Wounda, możesz odrzucić tę kartę z ręki i dobrać dwie karty
registerWoundReplacement('secret-wars-2-soulsword-colossus-steel-interception', async (state, ui, self) => {
  if (!state.hand.some((card) => card.instanceId === self.instanceId)) return false
  const chosen = await ui.choose([self], {
    prompt: 'Steel Interception: discard this card instead of gaining a Wound? (you draw two cards)',
    optional: true,
  })
  if (!chosen) return false
  if (!(await discardCardChecked(state, self.instanceId, ui))) return false
  drawCards(state, 2)
  return true
})

// strength: Cross-Dimensional Colossus Rampage. Solo: "other player" = gracz, więc gdy nie odkryjesz innej karty Colossusa,
// dostajesz Wounda (standardowy Rampage) i +2 Attack. Sama grana karta nie liczy się jako odkrycie.
registerCardAbility('secret-wars-2-soulsword-colossus-possessed-by-the-soulsword', async (state, { ui, self }) => {
  if (countPlayedThisTurn(state, { type: 'strength' }) === 0) return
  await crossDimensionalRampage(state, ui, 'Colossus', self.instanceId, async () => {
    await gainWound(state, ui)
    addAttack(state, 2)
  })
})

// X-Men: możesz zdobyć Bohatera X-Men z HQ lub z KO Pile do ręki
registerCardAbility('secret-wars-2-soulsword-colossus-rescue-my-family-from-hell', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { team: 'x-men' }) === 0) return
  const isXMenHero = (card: CardInstance) => {
    const data = state.cards[card.cardId]
    return !!data.hero && !!data.team?.includes('x-men')
  }
  const options = [...state.hq.flatMap((card) => (card && isXMenHero(card) ? [card] : [])), ...state.ko.filter(isXMenHero)]
  if (options.length === 0) return
  const chosen = await ui.choose(options, {
    prompt: 'Rescue My Family from Hell: gain an X-Men Hero from the HQ or the KO pile to your hand?',
    optional: true,
  })
  if (!chosen) return
  const hqIndex = state.hq.findIndex((card) => card?.instanceId === chosen.instanceId)
  if (hqIndex >= 0) {
    state.hq[hqIndex] = null
    claimShardsOn(state, chosen)
    refillHq(state)
  } else {
    const koIndex = state.ko.findIndex((card) => card.instanceId === chosen.instanceId)
    if (koIndex === -1) return
    state.ko.splice(koIndex, 1)
  }
  state.hand.push(chosen)
  logEvent(state, `Rescue My Family from Hell: gained ${state.cards[chosen.cardId].name} into hand`)
})

// ---------- Spider-Gwen ----------

registerCardAbility('secret-wars-2-spider-gwen-fateful-bridge', async (state, { ui }) => {
  if (patrolCitySpace(state, 'Bridge') !== 'empty') return
  logEvent(state, 'Patrol the Bridge: empty')
  await revealTopAndDrawIf(state, ui, costsAtMost(state, 2), 'Fateful Bridge: revealed the top card of your deck')
})

// Patrol the Rooftops: puste = uratuj Bystandera, potem +1 Attack za każdych dwóch Bystanderów w Victory Pile
registerCardAbility('secret-wars-2-spider-gwen-save-the-day', async (state, { ui }) => {
  if (patrolCitySpace(state, 'Rooftops') !== 'empty') return
  logEvent(state, 'Patrol the Rooftops: empty')
  await rescueBystander(state, ui)
  const bonus = Math.floor(countBystandersInPile(state, state.defeated) / 2)
  if (bonus > 0) addAttack(state, bonus)
})

// Dwa osobne Patrole: Bank oraz własny Victory Pile (puste = +1 Attack każdy)
registerCardAbility('secret-wars-2-spider-gwen-first-adventure', async (state) => {
  if (patrolCitySpace(state, 'Bank') === 'empty') {
    logEvent(state, 'Patrol the Bank: empty')
    addAttack(state, 1)
  }
  if (state.defeated.length === 0) {
    logEvent(state, 'Patrol your Victory Pile: empty')
    addAttack(state, 1)
  }
})

// Odkryj 3 górne karty, odłóż je (oryginalna kolejność), +1 Attack za każdą kosztującą do 2
registerCardAbility('secret-wars-2-spider-gwen-intertwining-webs', async (state, { ui }) => {
  const revealed = await revealTopCards(state, ui, 3, 'Intertwining Webs')
  const cheap = revealed.filter(costsAtMost(state, 2)).length
  putCardsOnTop(state, revealed)
  if (cheap > 0) addAttack(state, cheap)
})

// ---------- Time-Traveling Jean Grey ----------

// covert: wybierz Villaina na Rooftops lub Bridge, dostaje -2 Attack w tej turze (modyfikator lokacji, jak w Vol. 1)
registerCardAbility('secret-wars-2-time-traveling-jean-grey-throw-over-the-railing', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'covert' }) === 0) return
  const targets = ['Bridge', 'Rooftops'].flatMap((name) => {
    const villain = state.city[CITY_NAMES.indexOf(name)]
    return villain ? [villain] : []
  })
  const chosen = await chooseOneCard(ui, targets, 'Throw Over the Railing: choose a Villain on the Rooftops or Bridge (-2 Attack this turn)')
  if (!chosen) return
  const name = CITY_NAMES[state.city.findIndex((card) => card?.instanceId === chosen.instanceId)]
  state.locationAttackModifiers[name] = (state.locationAttackModifiers[name] ?? 0) - 2
})

registerCardAbility('secret-wars-2-time-traveling-jean-grey-bridge-to-a-better-future', async (state) => {
  if (patrolCitySpace(state, 'Bridge') !== 'empty') return
  logEvent(state, 'Patrol the Bridge: empty')
  state.bonusDrawNextTurn += 1
})

// Możesz przesunąć Villaina na sąsiednie pole; jeśli ktoś tam stoi, zamieniają się miejscami (wzorzec z Crime Stopper w FF)
registerCardAbility('secret-wars-2-time-traveling-jean-grey-telekinesis', async (state, { ui }) => {
  const targets = state.city.filter((card): card is CardInstance => !!card)
  if (targets.length === 0) return
  const villain = await ui.choose(targets, { prompt: 'Telekinesis: move a Villain to an adjacent city space?', optional: true })
  if (!villain) return
  const fromIndex = state.city.findIndex((card) => card?.instanceId === villain.instanceId)
  const neighbours = adjacentCityIndexes(state, fromIndex)
  if (neighbours.length === 0) return
  let toIndex = neighbours[0]
  if (neighbours.length > 1) {
    const chosenSlot = await ui.chooseOption(
      neighbours.map((index) => ({ id: String(index), label: CITY_NAMES[index] })),
      'Telekinesis: choose the adjacent city space',
    )
    toIndex = Number(chosenSlot)
  }
  const occupant = state.city[toIndex]
  state.city[toIndex] = villain
  state.city[fromIndex] = occupant ?? null
})

// X-Men: Patrol any city space: puste = zdobądź Bohatera z HQ pod nim i połóż go na wierzchu talii
registerCardAbility('secret-wars-2-time-traveling-jean-grey-change-history', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { team: 'x-men' }) === 0) return
  const targets = state.hq.flatMap((card, index) =>
    card && state.cards[card.cardId].hero && patrolCitySpace(state, CITY_NAMES[index]) === 'empty' ? [card] : [],
  )
  const chosen = await chooseOneCard(ui, targets, 'Change History: gain the Hero in the HQ under an empty city space and put it on top of your deck')
  if (!chosen) return
  const index = state.hq.findIndex((card) => card?.instanceId === chosen.instanceId)
  if (index < 0) return
  state.hq[index] = null
  claimShardsOn(state, chosen)
  refillHq(state)
  state.deck.push(chosen) // koniec tablicy = wierzch talii
  logEvent(state, `Change History: gained ${state.cards[chosen.cardId].name} on top of your deck`)
})
