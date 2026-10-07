import { registerCardAbility } from '../../../engine/cardAbilities'
import { drawCards, rescueBystander, addAttack, addRecruit, takeTopCards, gainWound, peekTopCard } from '../../../engine/game'
import { discardCard, koCard, countPlayedThisTurn } from '../../../engine/keywords'
import { registerDiscardReplacement, registerWoundReplacement } from '../../../engine/replacements'
import { CITY_NAMES } from '../../../engine/constants'
import type { CardInstance, GameState } from '../../../engine/types'
import { registerMasterStrikeReaction } from '../../../engine/masterStrikeReactions'
import type { UiAdapter } from '../../../engine/ui'
import { applyVersatile } from '../../../engine/versatile'


// ---------- Angel ----------

// Diving Catch: to nie jest efekt przy zagraniu, tylko reakcja na odrzucenie przez efekt karty.
// Używamy tego samego mechanizmu co Cyclops (Unending Energy), ale zwracamy false,
// czyli karta i tak normalnie trafia do odrzuconych.
registerDiscardReplacement('hero-angel-diving-catch', async (state) => {
  rescueBystander(state)
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
  await discardCard(state, chosen.instanceId, ui)

  // Jeśli efekt zastępczy zatrzymał kartę w ręce, to nie została odrzucona i nie ma bonusu
  const stillInHand = state.hand.some((c) => c.instanceId === chosen.instanceId)
  if (!stillInHand) addAttack(state, cost)
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

    await discardCard(state, chosen.instanceId, ui)
    if (state.hand.some((c) => c.instanceId === chosen.instanceId)) {
      kept.add(chosen.instanceId)
    } else {
      discarded++
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

  const options = [...state.hand, ...state.discard]
  if (options.length === 0) return

  const chosen = await ui.choose(options, {
    prompt: 'Whatever the Cost: możesz KO kartę z ręki lub stosu odrzuconych',
    optional: true,
  })
  if (chosen) koCard(state, chosen.instanceId)
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
  const neighbours = [fromIndex - 1, fromIndex + 1].filter((i) => i >= 0 && i < CITY_NAMES.length)
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

function countVillainsInPile(state: GameState, pile: CardInstance[]): number {
  return pile.filter((c) => {
    const data = state.cards[c.cardId]
    return data.villainGroup !== undefined || data.henchman === true
  }).length
}

registerCardAbility('hero-blade-vampiric-surge', async (state) => {
  addAttack(state, countVillainsInPile(state, state.defeated))
})

// ---------- Cable ----------

registerMasterStrikeReaction('hero-cable-disaster-survivalist', async (state, ui, self) => {
  const chosen = await ui.choose([self], {
    prompt: 'Disaster Survivalist: odrzucić tę kartę? (+3 dodatkowe karty na koniec tury)',
    optional: true,
  })
  if (!chosen) return

  await discardCard(state, self.instanceId, ui)

  // Jeśli efekt zastępczy zatrzymał kartę w ręce, to nie została odrzucona i nie ma bonusu
  const stillInHand = state.hand.some((c) => c.instanceId === self.instanceId)
  if (!stillInHand) state.bonusDrawNextTurn += 3
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

  await discardCard(state, self.instanceId, ui)

  // Gdyby coś zatrzymało kartę w ręce, to jej nie odrzucono i Rana nie jest zastąpiona
  if (state.hand.some((c) => c.instanceId === self.instanceId)) return false

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
  await discardCard(state, chosen.instanceId, ui)

  // Jeśli efekt zastępczy zatrzymał kartę w ręce, to nie została odrzucona
  if (state.hand.some((c) => c.instanceId === chosen.instanceId)) return

  if (data.recruit !== undefined) addRecruit(state, 4)
  if (data.attack !== undefined) addAttack(state, 4)
})

// Against All Odds: sam Versatile 5 jest w danych karty. Tu tylko warunek X-Force.
registerCardAbility('hero-domino-against-all-odds', async (state) => {
  if (countPlayedThisTurn(state, { team: 'x-force' }) > 0) {
    state.versatileBothThisTurn = true
  }
})