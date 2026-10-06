import { registerCardAbility } from '../../../engine/cardAbilities'
import { drawCards, rescueBystander, addAttack, takeTopCards } from '../../../engine/game'
import { discardCard, koCard, countPlayedThisTurn } from '../../../engine/keywords'
import { registerDiscardReplacement } from '../../../engine/replacements'
import { CITY_NAMES } from '../../../engine/constants'
import type { CardInstance, GameState } from '../../../engine/types'
import { registerMasterStrikeReaction } from '../../../engine/masterStrikeReactions'


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