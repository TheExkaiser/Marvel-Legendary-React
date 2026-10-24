import { registerCardAbility } from '../../../engine/cardAbilities'
import { drawCards, rescueBystander, addAttack, addRecruit, takeTopCards, gainWound, peekTopCard } from '../../../engine/game'
import { discardCard, koCard, countPlayedThisTurn, getEffectiveStrength, haveZone, discardCardChecked, koFromHandOrDiscard, koFromVictoryPile, villainsIn, isVillainCard } from '../../../engine/keywords'
import { claimTacticFree, defeatVillainFree, defeatVillainFromDeck } from '../../../engine/combat'
import { canDefeatVillain } from '../../../engine/villainRequirements'
import { teleportCard, registerTeleportHook } from '../../../engine/turn'
import { refillHq } from '../../../engine/recruit'
import { shuffle } from '../../../engine/random'
import { rescueCard } from '../../../engine/wounds'
import { drawRevealed } from '../../../engine/deckOps'
import { getCardData } from '../../../engine/cardData'
import { registerDiscardReplacement, registerWoundReplacement, registerDiscardShield, isEnemyEffect } from '../../../engine/replacements'
import { CITY_NAMES } from '../../../engine/constants'
import type { CardInstance, GameState } from '../../../engine/types'
import { registerMasterStrikeReaction } from '../../../engine/masterStrikeReactions'
import type { UiAdapter } from '../../../engine/ui'
import { applyVersatile } from '../../../engine/versatile'
import { adjacentCityIndexes } from '../../../engine/cityLayout'


// ---------- Angel ----------

// Diving Catch: to nie jest efekt przy zagraniu, tylko reakcja na odrzucenie przez efekt karty.
// Używamy tego samego mechanizmu co Cyclops (Unending Energy), ale zwracamy false,
// czyli karta i tak normalnie trafia do odrzuconych.
registerDiscardReplacement('hero-angel-diving-catch', async (state,  ui ) => {
  await rescueBystander(state, ui)
  drawCards(state, 2)
  return false
})

registerCardAbility('hero-angel-high-speed-chase', async (state, { ui }) => {
  drawCards(state, 2)
  if (state.hand.length === 0) return

  const chosen = await ui.choose(state.hand, {
    prompt: 'High-Speed Chase: wybierz kartę do odrzucenia',
    optional: false,
  })
  if (chosen) await discardCard(state, chosen.instanceId, ui)
})

registerCardAbility('hero-angel-drop-off-a-friend', async (state, { ui }) => {
  if (state.hand.length === 0) return

  const chosen = await ui.choose(state.hand, {
    prompt: "Drop off a Friend: możesz odrzucić kartę (+Attack równy jej kosztowi)",
    optional: true,
  })
  if (!chosen) return

  const cost = state.cards[chosen.cardId].cost ?? 0
  if (await discardCardChecked(state, chosen.instanceId, ui)) addAttack(state, cost)
})

registerCardAbility('hero-angel-strength-of-spirit', async (state, { ui }) => {
  let discarded = 0
  const kept = new Set<string>() // karty, które efekt zastępczy zostawił w ręce

  while (true) {
    const options = state.hand.filter((c) => !kept.has(c.instanceId))
    if (options.length === 0) break

    const chosen = await ui.choose(options, {
      prompt: `Strength of Spirit: odrzucono ${discarded}. Wybierz kolejną kartę albo zakończ`,
      optional: true,
    })
    if (!chosen) break

    if (await discardCardChecked(state, chosen.instanceId, ui)) {
      discarded++
    } else {
      kept.add(chosen.instanceId)
    }
  }

  if (discarded > 0) drawCards(state, discarded)
})

// ---------- Bishop ----------

// Każda zagrana kopia dolicza własne +2, więc dwie kopie dają +4 za każde KO
registerCardAbility('hero-bishop-absorb-energies', async (state) => {
  state.koRecruitBonus = (state.koRecruitBonus ?? 0) + 2
})

registerCardAbility('hero-bishop-whatever-the-cost', async (state, { ui }) => {
  drawCards(state, 1)
  if (countPlayedThisTurn(state, { type: 'covert' }) === 0) return

  await koFromHandOrDiscard(state, ui, 'Whatever the Cost: możesz KO kartę z ręki lub stosu odrzuconych')
})

registerCardAbility('hero-bishop-concussive-blast', async (state) => {
  if (countPlayedThisTurn(state, { type: 'ranged' }) >= 2) {
    addAttack(state, 3)
  }
})

registerCardAbility('hero-bishop-firepower-from-the-future', async (state, { ui }) => {
  const cards = takeTopCards(state, 4)
  if (cards.length === 0) return

  state.discard.push(...cards)
  for (const card of cards) {
    await ui.showInfo(card, 'Firepower from the Future: odrzucono kartę z wierzchu talii')
  }

  // Printed Attack = wartość z karty, bez żadnych modyfikatorów
  const total = cards.reduce((sum, c) => sum + (state.cards[c.cardId].attack ?? 0), 0)
  addAttack(state, total)

  if (countPlayedThisTurn(state, { team: 'x-men' }) === 0) return

  // X-Men: KO any number of those cards
  let remaining = [...cards]
  while (remaining.length > 0) {
    const chosen = await ui.choose(remaining, {
      prompt: 'Firepower from the Future (X-Men): możesz KO którąś z odrzuconych kart (zamknij, aby zakończyć)',
      optional: true,
    })
    if (!chosen) break
    koCard(state, chosen.instanceId)
    remaining = remaining.filter((c) => c.instanceId !== chosen.instanceId)
  }
})

// ---------- Blade ----------

registerCardAbility('hero-blade-night-hunter', async (state) => {
  state.locationDefeatBonuses = [
    ...(state.locationDefeatBonuses ?? []),
    { locations: ['Sewers', 'Rooftops'], recruit: 2 },
  ]
})

registerCardAbility('hero-blade-nowhere-to-hide', async (state) => {
  state.locationDefeatBonuses = [
    ...(state.locationDefeatBonuses ?? []),
    { locations: ['Sewers', 'Rooftops'], draw: 2 },
  ]
})

registerCardAbility('hero-blade-stalk-the-prey', async (state, { ui }) => {
  const targets = state.city.filter((c): c is CardInstance => !!c)
  if (targets.length === 0) return

  const villain = await ui.choose(targets, {
    prompt: 'Stalk the Prey: możesz przesunąć Villaina na sąsiednią pozycję',
    optional: true,
  })
  if (!villain) return

  const fromIndex = state.city.findIndex((c) => c?.instanceId === villain.instanceId)
  const neighbours = adjacentCityIndexes(state, fromIndex)
  if (neighbours.length === 0) return

  let toIndex = neighbours[0]
  if (neighbours.length > 1) {
    const chosenSlotId = await ui.chooseOption(
      neighbours.map((i) => ({ id: String(i), label: CITY_NAMES[i] })),
      'Stalk the Prey: wybierz sąsiednią pozycję',
    )
    toIndex = Number(chosenSlotId)
  }

  // Jeśli ktoś tam stoi, zamieniają się miejscami. Porwani Bystanderzy zostają przy swoim Villainie
  const occupant = state.city[toIndex]
  state.city[toIndex] = villain
  state.city[fromIndex] = occupant ?? null
})

registerCardAbility('hero-blade-vampiric-surge', async (state) => {
  addAttack(state, villainsIn(state, state.defeated).length)
})

// ---------- Cable ----------

registerMasterStrikeReaction('hero-cable-disaster-survivalist', async (state, ui, self) => {
  const chosen = await ui.choose([self], {
    prompt: 'Disaster Survivalist: odrzucić tę kartę? (+3 dodatkowe karty na koniec tury)',
    optional: true,
  })
  if (!chosen) return

  if (await discardCardChecked(state, self.instanceId, ui)) state.bonusDrawNextTurn += 3
})

// Strike at the Heart of Evil: +2 Attack tylko przeciwko Masterminds = Mastermind jest o 2 słabszy w tej turze
registerCardAbility('hero-cable-strike-at-the-heart-of-evil', async (state) => {
  state.mastermindAttackModifierThisTurn -= 2
})

// Rapid Response Force: sam Teleport jest w silniku (teleportCard), tu tylko premia
registerCardAbility('hero-cable-rapid-response-force', async (state) => {
  addAttack(state, countPlayedThisTurn(state, { team: 'x-force' }))
})

registerCardAbility('hero-cable-army-of-one', async (state, { ui }) => {
  let koCount = 0

  while (state.hand.length > 0) {
    const chosen = await ui.choose(state.hand, {
      prompt: `Army of One: skasowano ${koCount}. Wybierz kolejną kartę z ręki albo zakończ`,
      optional: true,
    })
    if (!chosen) break
    koCard(state, chosen.instanceId)
    koCount++
  }

  if (koCount > 0) addAttack(state, koCount)
})

// ---------- Colossus ----------

registerCardAbility('hero-colossus-draw-their-fire', async (state, { ui }) => {
  await gainWound(state, ui)
})

// Invulnerability: zamiast zdobywać Ranę, możesz odrzucić tę kartę z ręki i dobrać dwie karty
registerWoundReplacement('hero-colossus-invulnerability', async (state, ui, self) => {
  // Zamiennik działa tylko z ręki (gainWound sprawdza też zagrane karty)
  if (!state.hand.some((c) => c.instanceId === self.instanceId)) return false

  const chosen = await ui.choose([self], {
    prompt: 'Invulnerability: odrzucić tę kartę zamiast zdobywać Ranę? (dobierzesz 2 karty)',
    optional: true,
  })
  if (!chosen) return false

  // Gdyby coś zatrzymało kartę w ręce, to jej nie odrzucono i Rana nie jest zastąpiona
  if (!(await discardCardChecked(state, self.instanceId, ui))) return false

  drawCards(state, 2)
  return true
})

// Russian Heavy Tank: gdy masz dostać Ranę, możesz ujawnić tę kartę.
// Rana trafia do Ciebie normalnie, a Ty dobierasz kartę.
registerWoundReplacement('hero-colossus-russian-heavy-tank', async (state, ui, self) => {
  if (!state.hand.some((c) => c.instanceId === self.instanceId)) return false

  const chosen = await ui.choose([self], {
    prompt: 'Russian Heavy Tank: ujawnić tę kartę i dobrać kartę? (Rana i tak trafia do Ciebie)',
    optional: true,
  })
  if (chosen) drawCards(state, 1)

  return false // Rana nie jest zastępowana, gainWound zdobywa ją normalnie
})

registerCardAbility('hero-colossus-silent-statue', async (state) => {
  if (countPlayedThisTurn(state, { type: 'strength' }) > 0) {
    addAttack(state, 2)
  }
})

// ---------- Daredevil ----------

// Wspólna część: wybierz liczbę, odkryj wierzchnią kartę talii, zwróć true jeśli koszt się zgadza.
// Brak karty do odkrycia (pusta talia i odrzucone) = brak pytania i brak trafienia.
async function guessTopCardCost(state: GameState, ui: UiAdapter, cardName: string): Promise<boolean> {
  if (!peekTopCard(state)) return false

  const guess = await ui.chooseNumber(`${cardName}: wybierz liczbę (koszt wierzchniej karty talii)`)

  const top = peekTopCard(state)
  if (!top) return false

  const cost = state.cards[top.cardId].cost ?? 0
  const hit = cost === guess
  await ui.showInfo(top, `${cardName}: wybrano ${guess}, koszt karty to ${cost}. ${hit ? 'Trafiłeś!' : 'Pudło.'}`)
  return hit
}

// Backflip: licznik w state, hak w recruit.ts zrobimy w kroku 3
registerCardAbility('hero-daredevil-backflip', async (state) => {
  state.recruitsToDeckTop = (state.recruitsToDeckTop ?? 0) + 1
})

registerCardAbility('hero-daredevil-radar-sense', async (state, { ui }) => {
  if (await guessTopCardCost(state, ui, 'Radar Sense')) addAttack(state, 2)
})

registerCardAbility('hero-daredevil-blind-justice', async (state, { ui }) => {
  if (await guessTopCardCost(state, ui, 'Blind Justice')) drawCards(state, 1)
})

registerCardAbility('hero-daredevil-the-man-without-fear', async (state, { ui }) => {
  while (await guessTopCardCost(state, ui, 'The Man Without Fear')) {
    drawCards(state, 1)
  }
})

// ---------- Domino ----------

registerCardAbility('hero-domino-lucky-break', async (state, { self, ui }) => {
  drawCards(state, 1)
  if (countPlayedThisTurn(state, { team: 'x-force' }) > 0) {
    await applyVersatile(state, ui, 1, self)
  }
})

// Ready for Anything: Versatile 2 jest w danych karty (versatile: 2), obsługuje go playCard

registerCardAbility('hero-domino-specialized-ammunition', async (state, { ui }) => {
  if (state.hand.length === 0) return

  const chosen = await ui.choose(state.hand, {
    prompt: 'Specialized Ammunition: możesz odrzucić kartę z ręki',
    optional: true,
  })
  if (!chosen) return

  const data = state.cards[chosen.cardId]
  if (!(await discardCardChecked(state, chosen.instanceId, ui))) return

  if (data.recruit !== undefined) addRecruit(state, 4)
  if (data.attack !== undefined) addAttack(state, 4)
})

// Against All Odds: sam Versatile 5 jest w danych karty. Tu tylko warunek X-Force.
registerCardAbility('hero-domino-against-all-odds', async (state) => {
  if (countPlayedThisTurn(state, { team: 'x-force' }) > 0) {
    state.versatileBothThisTurn = true
  }
})

// ---------- Pomocnicze: "Hero" i koszty ----------

// Zdobyty Villain (Mind Control) też jest Bohaterem, dlatego dane przez getCardData
function isHero(state: GameState, c: CardInstance): boolean {
  const d = getCardData(state, c)
  return d.kind === undefined && d.villainGroup === undefined && !d.henchman
}

// Zagrywana karta nie jest jeszcze w cardsPlayedThisTurn, więc to są "other Heroes"
function otherHeroesPlayed(state: GameState): number {
  return state.cardsPlayedThisTurn.filter((c) => isHero(state, c)).length
}

// "Hero you have" = haveZone (ręka + zagrane + odrzucone)
function distinctHeroCosts(state: GameState): number {
  const costs = new Set<number>()
  for (const c of haveZone(state)) {
    if (isHero(state, c)) costs.add(getCardData(state, c).cost ?? 0)
  }
  return costs.size
}

// ---------- Elektra ----------

registerCardAbility('hero-elektra-first-strike', async (state) => {
  if (state.cardsPlayedThisTurn.length === 0) addAttack(state, 1)
})

registerCardAbility('hero-elektra-ninjitsu', async (state) => {
  drawCards(state, 1)
  if (countPlayedThisTurn(state, { type: 'covert' }) > 0) addRecruit(state, 2)
})

registerCardAbility('hero-elektra-sai-blades', async (state) => {
  const cheapHeroes = state.cardsPlayedThisTurn.filter((c) => {
    const cost = getCardData(state, c).cost
    return isHero(state, c) && cost !== undefined && cost <= 2
  }).length
  addAttack(state, cheapHeroes)
})

// Silent Meditation: hak w recruit.ts (placeRecruitedCard)
registerCardAbility('hero-elektra-silent-meditation', async (state) => {
  state.recruitsToHand = (state.recruitsToHand ?? 0) + 1
  if (countPlayedThisTurn(state, { team: 'marvel-knights' }) > 0) addRecruit(state, 2)
})

// ---------- Forge ----------

// Dirty Work: tech -> Villain w Sewers ma -2 Attack do końca tury (endTurn zeruje modyfikatory)
registerCardAbility('hero-forge-dirty-work', async (state) => {
  if (countPlayedThisTurn(state, { type: 'tech' }) === 0) return
  state.locationAttackModifiers['Sewers'] = (state.locationAttackModifiers['Sewers'] ?? 0) - 2
})

registerCardAbility('hero-forge-reboot', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'tech' }) === 0) return
  if (state.hand.length === 0) return

  const chosen = await ui.choose(state.hand, {
    prompt: 'Reboot: możesz odrzucić kartę (dobierzesz 2 karty)',
    optional: true,
  })
  if (!chosen) return

  if (!(await discardCardChecked(state, chosen.instanceId, ui))) return
  drawCards(state, 2)
})

// Overdrive: Versatile 3 jest w danych karty, obsługuje go playCard

// B.F.G.: tech, tech -> pokonaj Mastermind raz za darmo
registerCardAbility('hero-forge-bfg', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'tech' }) < 2) return
  if (state.tactics.length === 0) return
  await claimTacticFree(state, ui)
})

// ---------- Ghost Rider ----------

registerCardAbility('hero-ghost-rider-blazing-hellfire', async (state, { ui }) => {
  const options = villainsIn(state, state.defeated)
  if (options.length === 0) return

  const chosen = await ui.choose(options, {
    prompt: 'Blazing Hellfire: możesz KO Villaina ze stosu Victory (+3 Attack)',
    optional: true,
  })
  if (!chosen) return

  koFromVictoryPile(state, chosen.instanceId)
  addAttack(state, 3)
})

registerCardAbility('hero-ghost-rider-hell-on-wheels', async (state) => {
  if (countPlayedThisTurn(state, { team: 'marvel-knights' }) > 0) addRecruit(state, 2)
})

registerCardAbility('hero-ghost-rider-infernal-chains', async (state, { ui }) => {
  drawCards(state, 1)
  if (countPlayedThisTurn(state, { type: 'strength' }) === 0) return

  const targets = state.city.filter(
    (c): c is CardInstance =>
      !!c &&
      (getEffectiveStrength(state, c) ?? Infinity) <= 3 &&
      canDefeatVillain(state, c.cardId),
  )
  if (targets.length === 0) return

  const chosen = await ui.choose(targets, {
    prompt: 'Infernal Chains: pokonaj za darmo Villaina o sile 3 lub mniejszej',
    optional: true,
  })
  if (chosen) await defeatVillainFree(state, chosen.instanceId, ui)
})

// Penance Stare (solo): KO jednego Villaina ze swojego stosu Victory, +1 Attack.
registerCardAbility('hero-ghost-rider-penance-stare', async (state, { ui }) => {
  const options = villainsIn(state, state.defeated)
  if (options.length === 0) return

  const chosen = await ui.choose(options, {
    prompt: 'Penance Stare: wybierz Villaina do KO ze stosu Victory (+1 Attack)',
    optional: false,
  })
  if (!chosen) return

  // Marvel Knights: Villain wraca do Twojego stosu Victory, czyli po prostu go nie kasujemy
  if (countPlayedThisTurn(state, { team: 'marvel-knights' }) === 0) {
    koFromVictoryPile(state, chosen.instanceId)
  }
  addAttack(state, 1)
})

// ---------- Iceman ----------

// Zagrywana karta nie jest jeszcze w cardsPlayedThisTurn, więc countPlayedThisTurn liczy tylko "inne" karty.
// Zdobyty Villain (Mind Control) ma type: [], więc nie liczy się jako ranged.
registerCardAbility('hero-iceman-deep-freeze', async (state) => {
  drawCards(state, 1)
  addRecruit(state, countPlayedThisTurn(state, { type: 'ranged' }))
})

registerCardAbility('hero-iceman-ice-slide', async (state) => {
  addAttack(state, countPlayedThisTurn(state, { type: 'ranged' }))
})

// Frost Spike Armor sama jest strength, więc nie liczy siebie. Warunek ranged spełnia się, gdy count > 0.
registerCardAbility('hero-iceman-frost-spike-armor', async (state) => {
  drawCards(state, countPlayedThisTurn(state, { type: 'ranged' }))
})

// Impenetrable Ice Wall: reaguje tylko na efekty Villaina / Master Strike'a / Taktyki (isEnemyEffect)
registerWoundReplacement('hero-iceman-impenetrable-ice-wall', async (state, ui, self) => {
  if (!isEnemyEffect(state)) return false
  if (!state.hand.some((c) => c.instanceId === self.instanceId)) return false

  const chosen = await ui.choose([self], {
    prompt: 'Impenetrable Ice Wall: ujawnić tę kartę zamiast zdobywać Ranę?',
    optional: true,
  })
  return !!chosen
})

registerDiscardShield('hero-iceman-impenetrable-ice-wall', async (state, ui, self) => {
  const chosen = await ui.choose([self], {
    prompt: 'Impenetrable Ice Wall: ujawnić tę kartę zamiast odrzucać kartę?',
    optional: true,
  })
  return !!chosen
})

registerDiscardShield('hero-iceman-impenetrable-ice-wall', async (state, ui, self) => {
  const chosen = await ui.choose([self], {
    prompt: 'Impenetrable Ice Wall: ujawnić tę kartę zamiast odrzucać kartę?',
    optional: true,
  })
  return !!chosen
})

// ---------- Iron Fist ----------

registerCardAbility('hero-iron-fist-focus-chi', async (state) => {
  addRecruit(state, distinctHeroCosts(state))
})

registerCardAbility('hero-iron-fist-wield-the-iron-fist', async (state) => {
  addAttack(state, distinctHeroCosts(state))
})

registerCardAbility('hero-iron-fist-ancient-legacy', async (state, { self, ui }) => {
  drawCards(state, 1)
  if (countPlayedThisTurn(state, { type: 'strength' }) >= 2) {
    await applyVersatile(state, ui, 2, self)
  }
})

// Living Weapon: odkrywaj z talii, aż dwie karty mają ten sam koszt, i dobierz wszystkie odkryte.
// Rana ma koszt 0 (brak kosztu = 0).
registerCardAbility('hero-iron-fist-living-weapon', async (state, { ui }) => {
  const revealed: CardInstance[] = []
  const seenCosts = new Set<number>()

  while (true) {
    const [card] = takeTopCards(state, 1)
    if (!card) break // talia i odrzucone wyczerpane: dobierasz to, co odkryto
    revealed.push(card)

    const cost = state.cards[card.cardId].cost ?? 0
    const pair = seenCosts.has(cost)
    await ui.showInfo(
      card,
      pair
        ? `Living Weapon: ${revealed.length}. karta, koszt ${cost}, para!`
        : `Living Weapon: ${revealed.length}. karta, koszt ${cost}`,
    )
    if (pair) break
    seenCosts.add(cost)
  }

  drawRevealed(state, revealed)
})

// ---------- Jean Grey ----------

registerCardAbility('hero-jean-grey-psychic-search', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { team: 'x-men' }) > 0) await rescueBystander(state, ui)
})

registerCardAbility('hero-jean-grey-read-your-thoughts', async (state) => {
  state.rescueRecruitBonus = (state.rescueRecruitBonus ?? 0) + 1
})

registerCardAbility('hero-jean-grey-mind-over-matter', async (state) => {
  state.rescueDrawBonus = (state.rescueDrawBonus ?? 0) + 1
})

// Najpierw bonus, potem ratunek, żeby uratowani Bystanderzy też go uruchomili
registerCardAbility('hero-jean-grey-telekinetic-mastery', async (state, { ui }) => {
  state.rescueAttackBonus = (state.rescueAttackBonus ?? 0) + 1
  const xmen = countPlayedThisTurn(state, { team: 'x-men' })
  for (let i = 0; i < xmen; i++) await rescueBystander(state, ui)
})

// ---------- Nightcrawler ----------

// Bamf! i Blend Into Shadows: sam Teleport jest w silniku (słowo kluczowe), bez własnej zdolności

registerCardAbility('hero-nightcrawler-swashbuckler', async (state) => {
  if (countPlayedThisTurn(state, { type: 'covert' }) > 0 && countPlayedThisTurn(state, { type: 'instinct' }) > 0) {
    addAttack(state, 3)
  }
})

// Along for the Ride: przy zagraniu ALBO teleporcie możesz teleportować do 3 innych kart z ręki (bez sprawdzania słowa kluczowego)
async function teleportUpToThree(state: GameState, ui: UiAdapter, selfId: string): Promise<void> {
  for (let i = 0; i < 3; i++) {
    const options = state.hand.filter((c) => c.instanceId !== selfId)
    if (options.length === 0) return
    const chosen = await ui.choose(options, {
      prompt: `Along for the Ride: Teleport kolejnej karty (${i}/3), zamknij aby zakończyć`,
      optional: true,
    })
    if (!chosen) return
    await teleportCard(state, chosen.instanceId, ui, true)
  }
}

registerCardAbility('hero-nightcrawler-along-for-the-ride', async (state, { self, ui }) => {
  await teleportUpToThree(state, ui, self.instanceId)
})
registerTeleportHook('hero-nightcrawler-along-for-the-ride', async (state, ui, self) => {
  console.log('Along hook', { ui, self })
  await teleportUpToThree(state, ui, self.instanceId)
})

// ---------- Professor X ----------

registerCardAbility('hero-professor-x-class-dismissed', async (state, { ui }) => {
  const options = state.hq.filter((c): c is CardInstance => !!c && state.cards[c.cardId].hero !== undefined)
  if (options.length > 0) {
    const chosen = await ui.choose(options, {
      prompt: 'Class Dismissed: możesz włożyć Bohatera z HQ pod spód talii Bohaterów',
      optional: true,
    })
    if (chosen) {
      const slot = state.hq.findIndex((c) => c?.instanceId === chosen.instanceId)
      state.hq[slot] = null
      state.heroDeck.unshift(chosen) // wierzch talii to koniec tablicy, więc spód to początek
      refillHq(state)
    }
  }

  if (countPlayedThisTurn(state, { type: 'instinct' }) > 0) {
    await koFromHandOrDiscard(state, ui, 'Class Dismissed: możesz KO kartę z ręki lub stosu odrzuconych')
  }
})

registerCardAbility('hero-professor-x-psionic-astral-form', async (state) => {
  if (countPlayedThisTurn(state, { team: 'x-men' }) > 0) addAttack(state, 2)
})

registerCardAbility('hero-professor-x-telepathic-probe', async (state, { ui }) => {
  const top = state.villainDeck[state.villainDeck.length - 1]
  if (!top) return
  const data = state.cards[top.cardId]

  if (data.kind === 'bystander') {
    const chosen = await ui.choose([top], { prompt: 'Telepathic Probe: uratować tego Bystandera?', optional: true })
    if (chosen) {
      state.villainDeck.pop()
      await rescueCard(state, top, ui)
    }
    return
  }

  if (!isVillainCard(data)) {
    await ui.showInfo(top, 'Telepathic Probe: to nie Villain ani Bystander')
    return
  }

  const chosen = await ui.choose([top], {
    prompt: `Telepathic Probe: walczyć z ${data.name} teraz (siła ${getEffectiveStrength(state, top) ?? 0})?`,
    optional: true,
  })
  if (!chosen) return

  const ok = await defeatVillainFromDeck(state, ui, true)
  if (!ok) await ui.showInfo(top, 'Telepathic Probe: za mało Attack, Villain zostaje na talii')
})

// Mind Control: samo zdobycie Villaina robi offerMindControl w combat.ts (mindControlThisTurn)
registerCardAbility('hero-professor-x-mind-control', async (state) => {
  state.mindControlThisTurn = true
})

// ---------- Punisher ----------

registerCardAbility('hero-punisher-boom-goes-the-dynamite', async (state, { ui }) => {
  const top = peekTopCard(state)
  if (top) {
    const cost = state.cards[top.cardId].cost ?? 0
    await ui.showInfo(top, `Boom Goes the Dynamite: koszt ${cost}${cost === 0 ? ', KO' : ''}`)
    if (cost === 0) koCard(state, top.instanceId)
  }
  if (countPlayedThisTurn(state, { type: 'tech' }) > 0) drawCards(state, 1)
})

registerCardAbility('hero-punisher-hail-of-bullets', async (state, { ui }) => {
  const top = state.villainDeck[state.villainDeck.length - 1]
  if (!top) return
  const data = state.cards[top.cardId]
  if (!isVillainCard(data)) {
    await ui.showInfo(top, 'Hail of Bullets: to nie Villain')
    return
  }

  addAttack(state, data.vp ?? 0)
  if (countPlayedThisTurn(state, { type: 'tech' }) < 2) return

  const chosen = await ui.choose([top], { prompt: 'Hail of Bullets: pokonać tego Villaina za darmo?', optional: true })
  if (chosen) await defeatVillainFromDeck(state, ui, false)
})

// Hostile Interrogation: w solo "each other player" = Ty
registerCardAbility('hero-punisher-hostile-interrogation', async (state, { ui }) => {
  if (countPlayedThisTurn(state, { type: 'strength' }) === 0) return

  const top = peekTopCard(state)
  if (!top) return

  const cost = state.cards[top.cardId].cost ?? 0
  if (cost < 4) {
    await ui.showInfo(top, `Hostile Interrogation: koszt ${cost}, zostaje na talii`)
    return
  }

  await ui.showInfo(top, `Hostile Interrogation: koszt ${cost}, odrzucona (+1 Recruit)`)
  state.deck.pop() // peekTopCard gwarantuje, że wierzch to ostatni element talii
  state.discard.push(top)
  addRecruit(state, 1)
})

registerCardAbility('hero-punisher-the-punisher', async (state, { ui }) => {
  const revealed: CardInstance[] = []
  const seenCosts = new Set<number>()

  while (state.heroDeck.length > 0) {
    const card = state.heroDeck.pop()!
    revealed.push(card)

    const cost = state.cards[card.cardId].cost ?? 0
    const pair = seenCosts.has(cost)
    await ui.showInfo(
      card,
      pair
        ? `The Punisher: ${revealed.length}. karta, koszt ${cost}, para!`
        : `The Punisher: ${revealed.length}. karta, koszt ${cost}`,
    )
    if (pair) break
    seenCosts.add(cost)
  }

  addAttack(state, revealed.length)
  state.heroDeck.unshift(...shuffle(revealed)) // na spód talii w losowej kolejności
})

// ---------- Wolverine ----------

registerCardAbility('hero-wolverine-animal-instincts', async (state) => {
  drawCards(state, 1)
  if (countPlayedThisTurn(state, { type: 'instinct' }) > 0) addAttack(state, 2)
})

registerCardAbility('hero-wolverine-sudden-ambush', async (state) => {
  if (state.cardsDrawnThisTurn > 0) addAttack(state, 2)
})

registerCardAbility('hero-wolverine-no-mercy', async (state, { ui }) => {
  drawCards(state, 1)
  await koFromHandOrDiscard(state, ui, 'No Mercy: możesz KO kartę z ręki lub stosu odrzuconych')
})

// Dobiera tyle kart, ile extra kart już dobrano (liczone z góry, bo drawCards zwiększa licznik)
registerCardAbility('hero-wolverine-reckless-abandon', async (state) => {
  drawCards(state, state.cardsDrawnThisTurn)
})
