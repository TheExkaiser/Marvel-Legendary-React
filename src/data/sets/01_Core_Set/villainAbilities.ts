import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { registerDefeatRequirement } from '../../../engine/villainRequirements'
import { registerVpModifier } from '../../../engine/vpModifiers'
import { koCard, hasCard, revealCards, haveCards, isShieldHero, allOwnedCards } from '../../../engine/keywords'
import {
  gainWound,
  takeTopCards,
  peekTopCard,
  drawCards,
  recruitOfficer,
  rescueBystander,
  recruitHero,
  addRecruit,
} from '../../../engine/game'
import { getScheme } from '../../../engine/schemeRegistry'
import { resolveVillainDeckCard, checkEndConditions } from '../../../engine/villainPhase'
import { CITY_NAMES } from '../../../engine/constants'
import { refillHq } from '../../../engine/recruit'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'

// ---------- Blob ----------

registerDefeatRequirement('villain-blob', (state) => hasCard(state, { team: 'x-men' }))

// ---------- Juggernaut ----------

async function koTwoHeroesFrom(
  state: GameState,
  ui: UiAdapter,
  pile: CardInstance[],
  prompt: string,
): Promise<void> {
  for (let i = 0; i < 2; i++) {
    const heroes = pile.filter((c) => state.cards[c.cardId].hero !== undefined)
    if (heroes.length === 0) return

    const chosen =
      heroes.length === 1
        ? heroes[0]
        : await ui.choose(heroes, { prompt, optional: false })
    if (!chosen) return
    koCard(state, chosen.instanceId)
  }
}

registerVillainAbilities('villain-juggernaut', {
  onAmbush: async (state, ui) => {
    await koTwoHeroesFrom(state, ui, state.discard, 'Juggernaut (Ambush): KO bohatera ze stosu odrzuconych')
  },
  onEscape: async (state, ui) => {
    await koTwoHeroesFrom(state, ui, state.hand, 'Juggernaut (Escape): KO bohatera z ręki')
  },
})

// ---------- Mystique ----------

registerVillainAbilities('villain-mystique', {
  onEscape: async (state, ui, self) => {
    await ui.showInfo(self, 'Mystique zamienia się w Scheme Twist!')
    state.twistsRevealed += 1
    await getScheme(state).onTwist?.(state, state.twistsRevealed, ui)
  },
})

// ---------- Sabretooth ----------

async function revealTeamOrWound(state: GameState, ui: UiAdapter, team: string, label: string, prompt: string): Promise<void> {
  const toReveal = revealCards(state, { team })

  if (toReveal.length > 0) {
    const chosen =
      toReveal.length === 1
        ? toReveal[0]
        : await ui.choose(toReveal, { prompt, optional: false })
    if (chosen) {
      await ui.showInfo(chosen, `${prompt}: revealed a ${label} Hero`)
      return
    }
  }

  await gainWound(state, ui)
}

async function revealTypeOrWound(state: GameState, ui: UiAdapter, type: string, label: string, prompt: string): Promise<void> {
  const toReveal = revealCards(state, { type })

  if (toReveal.length > 0) {
    const chosen =
      toReveal.length === 1
        ? toReveal[0]
        : await ui.choose(toReveal, { prompt, optional: false })
    if (chosen) {
      await ui.showInfo(chosen, `${prompt}: revealed a ${label} Hero`)
      return
    }
  }

  await gainWound(state, ui)
}

registerVillainAbilities('villain-sabretooth', {
  onFight: async (state, ui) => {
    await revealTeamOrWound(state, ui, 'x-men', 'X-Men', 'Sabretooth (Fight): reveal an X-Men Hero or gain a Wound')
  },
  onEscape: async (state, ui) => {
    await revealTeamOrWound(state, ui, 'x-men', 'X-Men', 'Sabretooth (Escape): reveal an X-Men Hero or gain a Wound')
  },
})

// ---------- Doombot Legion ----------

registerVillainAbilities('henchmen-doombot-legion', {
  onFight: async (state, ui) => {
    const topTwo = takeTopCards(state, 2)
    if (topTwo.length === 0) return

    const chosen =
      topTwo.length === 1
        ? topTwo[0]
        : await ui.choose(topTwo, {
            prompt: 'Doombot Legion (Fight): wybierz kartę do KO, druga wróci na wierzch talii',
            optional: false,
          })
    if (!chosen) return

    state.ko.push(chosen)
    for (const card of topTwo) {
      if (card.instanceId !== chosen.instanceId) state.deck.push(card)
    }
  },
})

// ---------- Destroyer ----------

registerVillainAbilities('villain-destroyer', {
  onFight: async (state) => {
    const shieldHeroes = haveCards(state).filter((c) => isShieldHero(state.cards[c.cardId]))
    for (const c of shieldHeroes) {
      koCard(state, c.instanceId)
    }
  },
  onEscape: async (state, ui) => {
    await koTwoHeroesFrom(state, ui, haveCards(state), 'Destroyer (Escape): KO a Hero from your cards')
  },
})

// ---------- Enchantress ----------

registerVillainAbilities('villain-enchantress', {
  onFight: async (state) => {
    drawCards(state, 3)
  },
})

// ---------- Frost Giant ----------

registerVillainAbilities('villain-frost-giant', {
  onFight: async (state, ui) => {
    await revealTypeOrWound(state, ui, 'ranged', 'Ranged', 'Frost Giant (Fight): reveal a Ranged Hero or gain a Wound')
  },
  onEscape: async (state, ui) => {
    await revealTypeOrWound(state, ui, 'ranged', 'Ranged', 'Frost Giant (Escape): reveal a Ranged Hero or gain a Wound')
  },
})

// ---------- Ymir, Frost Giant King ----------

registerVillainAbilities('villain-ymir', {
  onAmbush: async (state, ui) => {
    await revealTypeOrWound(state, ui, 'ranged', 'Ranged', 'Ymir (Ambush): reveal a Ranged Hero or gain a Wound')
  },
  onFight: async (state, ui) => {
    let wounds = [...state.hand, ...state.discard].filter(
      (c) => state.cards[c.cardId].kind === 'wound',
    )
    while (wounds.length > 0) {
      const chosen = await ui.choose(wounds, {
        prompt: 'Ymir (Fight): KO a Wound from your hand or discard pile',
        optional: true,
      })
      if (!chosen) break
      koCard(state, chosen.instanceId)
      wounds = wounds.filter((c) => c.instanceId !== chosen.instanceId)
    }
  },
})

// ---------- Hand Ninjas ----------

registerVillainAbilities('henchmen-hand-ninjas', {
  onFight: async (state) => {
    addRecruit(state, 1)
  },
})

// ---------- Savage Land Mutates ----------

registerVillainAbilities('henchmen-savage-land-mutates', {
  onFight: async (state) => {
    state.bonusDrawNextTurn += 1
  },
})

// ---------- Sentinel ----------

registerVillainAbilities('henchmen-sentinel', {
  onFight: async (state, ui) => {
    const heroes = haveCards(state).filter((c) => state.cards[c.cardId].hero !== undefined)
    if (heroes.length === 0) return

    const chosen =
      heroes.length === 1
        ? heroes[0]
        : await ui.choose(heroes, {
            prompt: 'Sentinel (Fight): KO a Hero from your hand, played cards, or discard pile',
            optional: false,
          })
    if (!chosen) return
    koCard(state, chosen.instanceId)
  },
})

// ---------- Endless Armies of HYDRA ----------

registerVillainAbilities('villain-endless-armies-of-hydra', {
  onFight: async (state, ui) => {
    for (let i = 0; i < 2; i++) {
      const card = state.villainDeck.pop()
      if (!card) break
      await resolveVillainDeckCard(state, card, ui)
    }
    checkEndConditions(state)
  },
})

// ---------- HYDRA Kidnappers ----------

registerVillainAbilities('villain-hydra-kidnappers', {
  onFight: async (state, ui) => {
    if (state.officerDeck.length === 0) return

    const choice = await ui.chooseOption(
      [
        { id: 'yes', label: 'Yes' },
        { id: 'no', label: 'No' },
      ],
      'HYDRA Kidnappers (Fight): gain a S.H.I.E.L.D. Officer?',
    )
    if (choice !== 'yes') return

    const cost = state.cards[state.officerCardId].cost ?? 0
    addRecruit(state, cost)
    recruitOfficer(state)
  },
})

// ---------- Supreme HYDRA (tylko VP, brak zdolności bojowej) ----------

registerVpModifier('villain-supreme-hydra', (state, self, pile) => {
  const count = pile.filter(
    (c) => c.instanceId !== self.instanceId && state.cards[c.cardId].villainGroup === 'HYDRA',
  ).length
  return count * 3
})

// ---------- Viper ----------

async function woundIfNoOtherHydra(state: GameState, ui: UiAdapter, self: CardInstance): Promise<void> {
  const hasOtherHydra = state.defeated.some(
    (c) => c.instanceId !== self.instanceId && state.cards[c.cardId].villainGroup === 'HYDRA',
  )
  if (hasOtherHydra) return
  await gainWound(state, ui)
}

registerVillainAbilities('villain-viper', {
  onFight: async (state, ui, self) => {
    await woundIfNoOtherHydra(state, ui, self)
  },
  onEscape: async (state, ui, self) => {
    await woundIfNoOtherHydra(state, ui, self)
  },
})

// ---------- Baron Zemo ----------

registerVillainAbilities('villain-baron-zemo', {
  onFight: async (state) => {
    const avengersHeroes = haveCards(state, { team: 'avengers' })
    for (let i = 0; i < avengersHeroes.length; i++) {
      await rescueBystander(state)
    }
  },
})

// ---------- Melter ----------

registerVillainAbilities('villain-melter', {
  onFight: async (state, ui) => {
    const top = peekTopCard(state)
    if (!top) return

    await ui.showInfo(top, 'Melter (Fight): revealed the top card of your deck')

    const choice = await ui.chooseOption(
      [
        { id: 'ko', label: 'KO it' },
        { id: 'keep', label: 'Put it back' },
      ],
      'Melter (Fight): KO the revealed card or put it back?',
    )
    if (choice === 'ko') {
      koCard(state, top.instanceId)
    }
  },
})

// ---------- Ultron ----------

registerVpModifier('villain-ultron', (state) => {
  const techCount = allOwnedCards(state).filter((c) =>
    (state.cards[c.cardId].type ?? []).includes('tech'),
  ).length
  return techCount
})

registerVillainAbilities('villain-ultron', {
  onEscape: async (state, ui) => {
    await revealTypeOrWound(state, ui, 'tech', 'Tech', 'Ultron (Escape): reveal a Tech Hero or gain a Wound')
  },
})

// ---------- Whirlwind ----------

registerVillainAbilities('villain-whirlwind', {
  onFight: async (state, ui, self) => {
    const index = state.city.findIndex((c) => c?.instanceId === self.instanceId)
    const location = index !== -1 ? CITY_NAMES[index] : undefined
    if (location !== 'Rooftops' && location !== 'Bridge') return

    await koTwoHeroesFrom(state, ui, haveCards(state), 'Whirlwind (Fight): KO a Hero from your cards')
  },
})

// ---------- Abomination ----------

registerVillainAbilities('villain-abomination', {
  onFight: async (state, ui, self) => {
    const index = state.city.findIndex((c) => c?.instanceId === self.instanceId)
    const location = index !== -1 ? CITY_NAMES[index] : undefined
    if (location !== 'Streets' && location !== 'Bridge') return

    for (let i = 0; i < 3; i++) {
      await rescueBystander(state)
    }
  },
})

// ---------- The Leader ----------

registerVillainAbilities('villain-the-leader', {
  onAmbush: async (state, ui) => {
    const card = state.villainDeck.pop()
    if (!card) return
    await resolveVillainDeckCard(state, card, ui)
    checkEndConditions(state)
  },
})

// ---------- Maestro ----------

registerVillainAbilities('villain-maestro', {
  onFight: async (state, ui) => {
    const strengthCount = haveCards(state, { type: 'strength' }).length

    for (let i = 0; i < strengthCount; i++) {
      const heroes = haveCards(state).filter((c) => state.cards[c.cardId].hero !== undefined)
      if (heroes.length === 0) break

      const chosen =
        heroes.length === 1
          ? heroes[0]
          : await ui.choose(heroes, {
              prompt: 'Maestro (Fight): KO one of your Heroes',
              optional: false,
            })
      if (!chosen) break
      koCard(state, chosen.instanceId)
    }
  },
})

// ---------- Zzzax ----------

registerVillainAbilities('villain-zzzax', {
  onFight: async (state, ui) => {
    await revealTypeOrWound(state, ui, 'strength', 'Strength', 'Zzzax (Fight): reveal a Strength Hero or gain a Wound')
  },
  onEscape: async (state, ui) => {
    await revealTypeOrWound(state, ui, 'strength', 'Strength', 'Zzzax (Escape): reveal a Strength Hero or gain a Wound')
  },
})

// ---------- Paibok the Power Skrull ----------

registerVillainAbilities('villain-paibok', {
  onFight: async (state, ui) => {
    const targets = state.hq.filter((c): c is CardInstance => !!c)
    if (targets.length === 0) return

    const chosen =
      targets.length === 1
        ? targets[0]
        : await ui.choose(targets, {
            prompt: 'Paibok the Power Skrull (Fight): choose a Hero from the HQ to gain',
            optional: false,
          })
    if (!chosen) return

    const cost = state.cards[chosen.cardId].cost ?? 0
    addRecruit(state, cost)
    recruitHero(state, chosen.instanceId)
  },
})

// ---------- Super-Skrull ----------

registerVillainAbilities('villain-super-skrull', {
  onFight: async (state, ui) => {
    const heroes = haveCards(state).filter((c) => state.cards[c.cardId].hero !== undefined)
    if (heroes.length === 0) return

    const chosen =
      heroes.length === 1
        ? heroes[0]
        : await ui.choose(heroes, {
            prompt: 'Super-Skrull (Fight): KO one of your Heroes',
            optional: false,
          })
    if (!chosen) return
    koCard(state, chosen.instanceId)
  },
})

// ---------- Skrull Queen Veranke ----------

registerVillainAbilities('villain-skrull-queen-veranke', {
  onAmbush: async (state, ui, self) => {
    const candidates = state.hq.filter((c): c is CardInstance => !!c)
    if (candidates.length === 0) return

    let highest = candidates[0]
    for (const c of candidates) {
      if ((state.cards[c.cardId].cost ?? 0) > (state.cards[highest.cardId].cost ?? 0)) {
        highest = c
      }
    }

    const index = state.hq.findIndex((c) => c?.instanceId === highest.instanceId)
    state.hq[index] = null
    refillHq(state)
    state.attachedCards[self.instanceId] = highest

    await ui.showInfo(
      self,
      `Skrull Queen Veranke pins ${state.cards[highest.cardId].name} (Attack ${state.cards[highest.cardId].cost ?? 0})`,
    )
  },
  onFight: async (state, ui, self) => {
    const attached = state.attachedCards[self.instanceId]
    if (attached) {
      state.discard.push(attached)
      delete state.attachedCards[self.instanceId]
    }
  },
})

// ---------- Skrull Shapeshifters ----------

registerVillainAbilities('villain-skrull-shapeshifters', {
  onAmbush: async (state, ui, self) => {
    let index = -1
    for (let i = state.hq.length - 1; i >= 0; i--) {
      if (state.hq[i]) {
        index = i
        break
      }
    }
    if (index === -1) return

    const chosen = state.hq[index]!
    state.hq[index] = null
    refillHq(state)
    state.attachedCards[self.instanceId] = chosen

    await ui.showInfo(
      self,
      `Skrull Shapeshifters pin ${state.cards[chosen.cardId].name} (Attack ${state.cards[chosen.cardId].cost ?? 0})`,
    )
  },
  onFight: async (state, ui, self) => {
    const attached = state.attachedCards[self.instanceId]
    if (attached) {
      state.discard.push(attached)
      delete state.attachedCards[self.instanceId]
    }
  },
})

// ---------- Spider-Foes ----------

// Doctor Octopus: normalnie dobierasz 6 kart, więc +2 daje osiem
registerVillainAbilities('villain-doctor-octopus', {
  onFight: async (state) => {
    state.bonusDrawNextTurn += 2
  },
})

// Green Goblin: porywa Bystandera
registerVillainAbilities('villain-green-goblin', {
  onAmbush: async (state, _ui, self) => {
    const bystander = state.bystanders.pop()
    if (!bystander) return
    const list = state.captives[self.instanceId] ?? []
    list.push(bystander)
    state.captives[self.instanceId] = list
  },
})

// The Lizard: "each other player gains a Wound", czyli u nas gracz, ale tylko w Sewers
registerVillainAbilities('villain-the-lizard', {
  onFight: async (state, ui, self) => {
    const index = state.city.findIndex((c) => c?.instanceId === self.instanceId)
    const location = index !== -1 ? CITY_NAMES[index] : undefined
    if (location !== 'Sewers') return

    await gainWound(state, ui)
  },
})

// Venom: nie można go pokonać bez Bohatera (karty startowe też mają pole hero)
registerDefeatRequirement('villain-venom', (state) =>
  haveCards(state).some((c) => state.cards[c.cardId].hero !== undefined),
)

registerDefeatRequirement('villain-venom', (state) => hasCard(state, { type: 'covert' }))

registerVillainAbilities('villain-venom', {
  onEscape: async (state, ui) => {
    await gainWound(state, ui)
  },
})