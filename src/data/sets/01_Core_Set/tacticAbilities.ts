import { registerCardAbility } from '../../../engine/cardAbilities'
import { recruitHero, drawCards, fightVillain, gainWound, rescueBystander } from '../../../engine/game'
import { revealCards, haveCards } from '../../../engine/keywords'
import type { CardInstance } from '../../../engine/types'

registerCardAbility('drdoom-dark-technology', async (state, { ui }) => {
  const targets = state.hq.filter(
    (c): c is CardInstance =>
      !!c &&
      ((state.cards[c.cardId].type ?? []).includes('tech') ||
        (state.cards[c.cardId].type ?? []).includes('ranged')),
  )
  if (targets.length === 0) return

  const chosen = await ui.choose(targets, {
    prompt: 'Dark Technology: możesz zwerbować Tech lub Ranged bohatera za darmo',
    optional: true,
  })
  if (!chosen) return

  const cost = state.cards[chosen.cardId].cost ?? 0
  state.recruit += cost
  recruitHero(state, chosen.instanceId)
})

registerCardAbility('drdoom-monarchs-decree', async (state, { ui }) => {
  const choice = await ui.chooseOption(
    [
      { id: 'draw', label: 'Dobierz kartę' },
      { id: 'discard', label: 'Odrzuć kartę' },
    ],
    "Monarch's Decree: wybierz efekt",
  )

  if (choice === 'draw') {
    drawCards(state, 1)
  } else if (choice === 'discard' && state.hand.length > 0) {
    const [card] = state.hand.splice(0, 1) // TODO: pozwolić graczowi wybrać KTÓRĄ kartę odrzucić
    state.discard.push(card)
  }
})

registerCardAbility('drdoom-secrets-of-time-travel', async (state) => {
  state.extraTurnsQueued += 1
})

registerCardAbility('drdoom-treasures-of-latveria', async (state) => {
  state.bonusDrawNextTurn += 3
})

registerCardAbility('loki-cruel-ruler', async (state, { ui }) => {
  const targets = state.city.filter((c): c is CardInstance => !!c)
  if (targets.length === 0) return

  const chosen = await ui.choose(targets, {
    prompt: 'Cruel Ruler: defeat a Villain in the City for free',
    optional: true,
  })
  if (!chosen) return

  const strength = state.cards[chosen.cardId].strength ?? 0
  state.attack += strength
  await fightVillain(state, chosen.instanceId, ui)
})

registerCardAbility('loki-maniacal-tyrant', async (state, { ui }) => {
  for (let i = 0; i < 4 && state.discard.length > 0; i++) {
    const chosen = await ui.choose(state.discard, {
      prompt: `Maniacal Tyrant: KO a card from your discard pile (${i + 1}/4)`,
      optional: true,
    })
    if (!chosen) break

    const index = state.discard.findIndex((c) => c.instanceId === chosen.instanceId)
    if (index === -1) break
    const [card] = state.discard.splice(index, 1)
    state.ko.push(card)
  }
})

registerCardAbility('loki-vanishing-illusions', async (state, { ui }) => {
  const villains = state.defeated.filter((c) => {
    const data = state.cards[c.cardId]
    return data.strength !== undefined && !data.hero
  })
  if (villains.length === 0) return

  const chosen = await ui.choose(villains, {
    prompt: 'Vanishing Illusions: KO a Villain from your Victory Pile',
    optional: true,
  })
  if (!chosen) return

  const index = state.defeated.findIndex((c) => c.instanceId === chosen.instanceId)
  if (index === -1) return
  const [card] = state.defeated.splice(index, 1)
  state.ko.push(card)
})

registerCardAbility('loki-whispers-and-lies', async (state, { ui }) => {
  for (let i = 0; i < 2; i++) {
    const bystanders = state.defeated.filter((c) => state.cards[c.cardId].kind === 'bystander')
    if (bystanders.length === 0) break

    const chosen = await ui.choose(bystanders, {
      prompt: `Whispers and Lies: KO a Bystander from your Victory Pile (${i + 1}/2)`,
      optional: true,
    })
    if (!chosen) break

    const index = state.defeated.findIndex((c) => c.instanceId === chosen.instanceId)
    if (index === -1) break
    const [card] = state.defeated.splice(index, 1)
    state.ko.push(card)
  }
})

registerCardAbility('magneto-bitter-captor', async (state, { ui }) => {
  const targets = state.hq.filter(
    (c): c is CardInstance => !!c && (state.cards[c.cardId].team ?? []).includes('x-men'),
  )
  if (targets.length === 0) return

  const chosen = await ui.choose(targets, {
    prompt: 'Bitter Captor: recruit an X-Men Hero from the HQ for free',
    optional: true,
  })
  if (!chosen) return

  const cost = state.cards[chosen.cardId].cost ?? 0
  state.recruit += cost
  recruitHero(state, chosen.instanceId)
})

registerCardAbility('magneto-crushing-shockwave', async (state, { ui }) => {
  const xmenHeroes = revealCards(state, { team: 'x-men' })

  if (xmenHeroes.length > 0) {
    await ui.showInfo(xmenHeroes[0], 'Crushing Shockwave: revealed an X-Men Hero')
    return
  }

  await gainWound(state, ui)
  await gainWound(state, ui)
})

registerCardAbility('magneto-electromagnetic-bubble', async (state, { ui }) => {
  const xmenHeroes = haveCards(state, { team: 'x-men' })
  if (xmenHeroes.length === 0) return

  const chosen = await ui.choose(xmenHeroes, {
    prompt: 'Electromagnetic Bubble: choose an X-Men Hero to add to your next hand',
    optional: true,
  })
  if (!chosen) return

  state.extraCardToHand = chosen.instanceId
})

registerCardAbility('magneto-xaviers-nemesis', async (state) => {
  const xmenHeroes = haveCards(state, { team: 'x-men' })
  for (let i = 0; i < xmenHeroes.length; i++) {
    await rescueBystander(state)
  }
})

registerCardAbility('redskull-endless-resources', async (state) => {
  state.recruit += 4
})

registerCardAbility('redskull-hydra-conspiracy', async (state) => {
  drawCards(state, 2)

  const hydraCount = state.defeated.filter(
    (c) => state.cards[c.cardId].villainGroup === 'HYDRA',
  ).length
  if (hydraCount > 0) drawCards(state, hydraCount)
})

registerCardAbility('redskull-negablast-grenades', async (state) => {
  state.attack += 3
})

registerCardAbility('redskull-ruthless-dictator', async (state, { ui }) => {
  const count = Math.min(3, state.deck.length)
  if (count === 0) return

  // Zdejmujemy z wierzchu (koniec tablicy = wierzch, tak jak w drawCards/Master Strike DrDooma)
  const topCards = state.deck.splice(state.deck.length - count, count)

  const toKo = await ui.choose(topCards, {
    prompt: 'Ruthless Dictator: choose a card to KO',
    optional: false,
  })
  const afterKo = topCards.filter((c) => c.instanceId !== toKo?.instanceId)
  if (toKo) state.ko.push(toKo)

  const toDiscard = await ui.choose(afterKo, {
    prompt: 'Ruthless Dictator: choose a card to discard',
    optional: false,
  })
  const remaining = afterKo.filter((c) => c.instanceId !== toDiscard?.instanceId)
  if (toDiscard) state.discard.push(toDiscard)

  state.deck.push(...remaining) // reszta wraca na wierzch talii
})